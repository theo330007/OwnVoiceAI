'use server';

import { createClient } from './supabase';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  console.log('getCurrentUser - User found:', !!user, 'Error:', error?.message);

  if (error || !user) {
    return null;
  }

  // Fetch full user profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(email: string, password: string, name: string) {
  const supabase = await createClient();

  // Sign up the user (email confirmation should be disabled in Supabase settings)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw authError;
  }

  // Check if user needs to confirm email
  if (authData.user && !authData.session) {
    throw new Error('Please check your email to confirm your account. If you disabled email confirmation in Supabase, delete this user and try again.');
  }

  // Create user profile in our users table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
      });

    if (profileError) {
      // Ignore error if user already exists
      if (profileError.code !== '23505') {
        throw profileError;
      }
    }
  }

  return authData;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}
