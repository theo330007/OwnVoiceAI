'use server';

import { createClient } from '@/lib/supabase';
import type { Trend } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getUserNicheTrends(userId: string): Promise<Trend[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .select('*')
    .eq('layer', 'niche')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user niche trends:', error);
    return [];
  }

  return data as Trend[];
}

export async function addUserNicheTrend(userId: string, trend: {
  trend_type: string;
  title: string;
  description: string;
  source_url?: string;
  keywords: string[];
  relevance_score?: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .insert({
      layer: 'niche',
      user_id: userId,
      trend_type: trend.trend_type,
      title: trend.title,
      description: trend.description,
      source_url: trend.source_url || null,
      keywords: trend.keywords,
      relevance_score: trend.relevance_score || 75,
      metadata: {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add niche trend: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);

  return data;
}

export async function updateUserNicheTrend(
  trendId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    keywords?: string[];
    relevance_score?: number;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .update(updates)
    .eq('id', trendId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update niche trend: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);

  return data;
}

export async function deleteUserNicheTrend(trendId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('trends')
    .delete()
    .eq('id', trendId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete niche trend: ${error.message}`);
  }

  revalidatePath(`/admin/users/${userId}`);
}

export async function getStrategicInsights(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_strategic_insights', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error fetching strategic insights:', error);
    return [];
  }

  return data;
}
