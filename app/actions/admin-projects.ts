'use server';

import { createClient } from '@/lib/supabase';
import type { Project } from '@/lib/types/project';
import { revalidatePath } from 'next/cache';

export async function getAllProjects(): Promise<(Project & { user_name?: string; user_email?: string })[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      user:users!projects_user_id_fkey (
        name,
        email
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }

  return data.map((project: any) => ({
    ...project,
    user_name: project.user?.name,
    user_email: project.user?.email,
  })) as any;
}

export async function getProjectByIdAdmin(projectId: string): Promise<Project & { user_name?: string; user_email?: string } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      user:users!projects_user_id_fkey (
        name,
        email,
        business_name,
        industry
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return {
    ...data,
    user_name: data.user?.name,
    user_email: data.user?.email,
  } as any;
}

export async function getProjectStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('status, user_id');

  if (error) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      draft: 0,
      totalUsers: 0
    };
  }

  const uniqueUsers = new Set(data.map(p => p.user_id)).size;

  const stats = {
    total: data.length,
    active: data.filter((p) => p.status === 'active').length,
    completed: data.filter((p) => p.status === 'completed').length,
    draft: data.filter((p) => p.status === 'draft').length,
    totalUsers: uniqueUsers,
  };

  return stats;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }

  return data as Project[];
}

export async function createProjectForUser(
  userId: string,
  input: {
    title: string;
    description?: string;
  }
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      selected_trends: [],
      status: 'draft',
      current_step: 'setup',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/projects');

  return data as Project;
}
