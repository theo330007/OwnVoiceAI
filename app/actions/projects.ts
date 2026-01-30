'use server';

import { createClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/lib/types/project';
import { revalidatePath } from 'next/cache';

export async function getUserProjects(): Promise<Project[]> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data as Project[];
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const user = await requireAuth();
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

export async function createProject(input: CreateProjectInput) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      selected_trends: input.selected_trends || [],
      status: 'draft',
      current_step: 'setup',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  revalidatePath('/projects');
  return data as Project;
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const user = await requireAuth();
  const supabase = await createClient();

  // Verify ownership
  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!existingProject) {
    throw new Error('Project not found or unauthorized');
  }

  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  return data as Project;
}

export async function deleteProject(projectId: string) {
  const user = await requireAuth();
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
}

export async function getProjectStats() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .eq('user_id', user.id);

  if (error) {
    return { total: 0, active: 0, completed: 0, draft: 0 };
  }

  const stats = {
    total: data.length,
    active: data.filter((p) => p.status === 'active').length,
    completed: data.filter((p) => p.status === 'completed').length,
    draft: data.filter((p) => p.status === 'draft').length,
  };

  return stats;
}
