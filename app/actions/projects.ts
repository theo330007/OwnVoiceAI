'use server';

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export interface Project {
  id: string;
  user_id: string;
  workflow_id: string | null;
  strategic_insight_id: string | null;
  title: string;
  description: string | null;
  content_type: 'educational' | 'behind_the_scenes' | 'promotional' | 'interactive';
  trend_title: string | null;
  status: 'in_progress' | 'completed' | 'archived';
  current_phase: 'ideation' | 'drafting' | 'editing' | 'ready' | 'published';
  completion_percentage: number;
  hook: string | null;
  concept: string | null;
  cta: string | null;
  final_content: string | null;
  media_urls: string[] | null;
  scheduled_date: string | null;
  published_at: string | null;
  published_url: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  user_id: string;
  note_type: 'general' | 'feedback' | 'revision' | 'idea';
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(status?: 'in_progress' | 'completed' | 'archived') {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_projects', {
    p_user_id: user.id,
    p_status: status || null,
    limit_count: 50,
  });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data as (Project & { notes_count: number })[];
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data as Project;
}

/**
 * Get project statistics
 */
export async function getProjectStats() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_project_stats', {
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error fetching project stats:', error);
    return null;
  }

  return data?.[0] || {
    total_projects: 0,
    in_progress_projects: 0,
    completed_projects: 0,
    avg_completion_percentage: 0,
  };
}

/**
 * Update project details
 */
export async function updateProject(
  projectId: string,
  updates: Partial<{
    title: string;
    description: string;
    status: 'in_progress' | 'completed' | 'archived';
    current_phase: 'ideation' | 'drafting' | 'editing' | 'ready' | 'published';
    completion_percentage: number;
    hook: string;
    concept: string;
    cta: string;
    final_content: string;
    media_urls: string[];
    scheduled_date: string;
    published_at: string;
    published_url: string;
  }>
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  // Set completed_at if status is being changed to completed
  const updateData: any = { ...updates };
  if (updates.status === 'completed' && updates.completion_percentage === 100) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);

  return data as Project;
}

/**
 * Add a note to a project
 */
export async function addProjectNote(
  projectId: string,
  content: string,
  noteType: 'general' | 'feedback' | 'revision' | 'idea' = 'general'
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('project_notes')
    .insert({
      project_id: projectId,
      user_id: user.id,
      note_type: noteType,
      content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add note: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);

  return data as ProjectNote;
}

/**
 * Get notes for a project
 */
export async function getProjectNotes(projectId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('project_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching project notes:', error);
    return [];
  }

  return data as ProjectNote[];
}

/**
 * Delete a project note
 */
export async function deleteProjectNote(noteId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('project_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  revalidatePath('/projects');
}

/**
 * Archive a project
 */
export async function archiveProject(projectId: string) {
  return updateProject(projectId, { status: 'archived' });
}

/**
 * Create a project directly from an idea card (no workflow)
 */
export async function createProjectFromIdea(input: {
  hook: string;
  concept: string;
  cta: string;
  pillar: string;
  format: 'carousel' | 'reel' | 'storytelling' | 'sales';
  source_type: string;
}): Promise<Project> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const FORMAT_TO_CONTENT_TYPE: Record<string, Project['content_type']> = {
    carousel:     'educational',
    reel:         'educational',
    storytelling: 'behind_the_scenes',
    sales:        'promotional',
  };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: input.hook.length > 80 ? input.hook.slice(0, 77) + '…' : input.hook,
      description: input.concept,
      content_type: FORMAT_TO_CONTENT_TYPE[input.format] ?? 'educational',
      trend_title: input.pillar,
      status: 'in_progress',
      current_phase: 'ideation',
      completion_percentage: 5,
      hook: input.hook,
      concept: input.concept,
      cta: input.cta,
      metadata: { source_type: input.source_type, format: input.format, pillar: input.pillar },
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create project: ${error.message}`);

  revalidatePath('/projects');
  revalidatePath('/dashboard');

  return data as Project;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  revalidatePath('/projects');
  revalidatePath('/dashboard');
}
