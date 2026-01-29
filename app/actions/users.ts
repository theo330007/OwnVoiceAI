'use server';

import { createClient } from '@/lib/supabase';
import type { User, UserStats, CreateUserInput, UpdateUserInput } from '@/lib/types/user';
import { revalidatePath } from 'next/cache';

export async function getAllUsers(): Promise<User[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data as User[];
}

export async function getUserStats(): Promise<UserStats[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .order('total_validations', { ascending: false });

  if (error) {
    console.error('Error fetching user stats:', error);
    return [];
  }

  return data as UserStats[];
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: input.email,
      name: input.name,
      business_name: input.business_name || null,
      industry: input.industry || null,
      bio: input.bio || null,
      subscription_tier: input.subscription_tier || 'free',
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  revalidatePath('/admin/users');

  return data as User;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);

  return data as User;
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  revalidatePath('/admin/users');
}

export async function toggleUserStatus(id: string, isActive: boolean): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to toggle user status: ${error.message}`);
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
}

export async function getUserValidations(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('validations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching user validations:', error);
    return [];
  }

  return data;
}
