'use server';

import { createClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface CollaborationNote {
  id: string;
  project_id: string;
  user_id: string;
  admin_id: string;
  note_type: 'strategy' | 'recommendation' | 'insight' | 'general';
  title: string | null;
  content: string;
  is_pinned: boolean;
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
