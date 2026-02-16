'use server';

import { createClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface CollaborationNote {
  id: string;
  project_id: string | null;
  workflow_id: string | null;
  user_id: string;
  admin_id: string;
  note_type: 'strategy' | 'recommendation' | 'insight' | 'general';
  title: string | null;
  content: string;
  is_pinned: boolean;
  created_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export async function getProjectCollaborationNotes(projectId: string): Promise<CollaborationNote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collaboration_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching collaboration notes:', error);
    return [];
  }

  return data as CollaborationNote[];
}

export async function addProjectCollaborationNote(
  projectId: string,
  userId: string,
  note: {
    note_type: 'strategy' | 'recommendation' | 'insight' | 'general';
    title?: string;
    content: string;
    is_pinned?: boolean;
  }
) {
  const supabase = await createClient();
  const admin = await getCurrentUser();

  if (!admin) {
    throw new Error('Admin not authenticated');
  }

  const { data, error } = await supabase
    .from('collaboration_notes')
    .insert({
      project_id: projectId,
      user_id: userId,
      admin_id: admin.id,
      note_type: note.note_type,
      title: note.title || null,
      content: note.content,
      is_pinned: note.is_pinned || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add collaboration note: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);

  return data;
}

export async function updateCollaborationNote(
  noteId: string,
  projectId: string,
  updates: {
    title?: string;
    content?: string;
    is_pinned?: boolean;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collaboration_notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update note: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);

  return data;
}

export async function deleteCollaborationNote(noteId: string, projectId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('collaboration_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
}

// ============= Workflow Notes Functions =============

export async function getWorkflowCollaborationNotes(workflowId: string): Promise<CollaborationNote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collaboration_notes')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workflow collaboration notes:', error);
    return [];
  }

  return data as CollaborationNote[];
}

export async function addWorkflowCollaborationNote(
  workflowId: string,
  note: {
    note_type: 'strategy' | 'recommendation' | 'insight' | 'general';
    title?: string;
    content: string;
    is_pinned?: boolean;
  }
) {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  console.log('Adding workflow note for workflowId:', workflowId);
  console.log('Current user:', currentUser.id);

  // Get workflow to find the user_id
  const { data: workflow, error: workflowError } = await supabase
    .from('content_workflows')
    .select('user_id')
    .eq('id', workflowId)
    .single();

  if (workflowError) {
    console.error('Error fetching workflow:', workflowError);
    throw new Error(`Workflow not found: ${workflowError.message}`);
  }

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  console.log('Workflow user_id:', workflow.user_id);

  // Determine if the current user is the workflow owner or admin
  const isWorkflowOwner = currentUser.id === workflow.user_id;

  console.log('Is workflow owner:', isWorkflowOwner);

  const insertData = {
    workflow_id: workflowId,
    user_id: workflow.user_id,
    admin_id: currentUser.id,
    note_type: note.note_type,
    title: note.title || null,
    content: note.content,
    is_pinned: note.is_pinned || false,
    created_by_user: isWorkflowOwner,
  };

  console.log('Inserting note data:', insertData);

  const { data, error } = await supabase
    .from('collaboration_notes')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error inserting note:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to add workflow note: ${error.message} (Code: ${error.code}, Details: ${error.details})`);
  }

  console.log('Note inserted successfully:', data);

  revalidatePath(`/lab/workflow/${workflowId}`);

  return data;
}

export async function deleteWorkflowNote(noteId: string, workflowId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('collaboration_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }

  revalidatePath(`/lab/workflow/${workflowId}`);
}
