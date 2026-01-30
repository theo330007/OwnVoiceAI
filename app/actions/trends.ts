'use server';

import { createClient } from '@/lib/supabase';
import type { Trend, TrendLayer } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getTrendsByLayer(layer: TrendLayer): Promise<Trend[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .select('*')
    .eq('layer', layer)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching trends:', error);
    return [];
  }

  return data as Trend[];
}

export async function addTrend(trend: {
  layer: TrendLayer;
  trend_type: string;
  title: string;
  description: string;
  source_url?: string;
  keywords: string[];
  relevance_score?: number;
  metadata?: Record<string, any>;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trends')
    .insert({
      layer: trend.layer,
      trend_type: trend.trend_type,
      title: trend.title,
      description: trend.description,
      source_url: trend.source_url || null,
      keywords: trend.keywords,
      relevance_score: trend.relevance_score || 75,
      metadata: trend.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add trend: ${error.message}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/trends');

  return data;
}

export async function deleteTrend(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('trends').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete trend: ${error.message}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/trends');
}

export async function refreshMacroTrends() {
  // For MVP, this just triggers a page reload
  // In Phase 2, this will trigger an Inngest event
  revalidatePath('/dashboard');
  return { success: true };
}

export async function refreshNicheTrends() {
  // For MVP, this just triggers a page reload
  // In Phase 2, this will trigger an Inngest event
  revalidatePath('/dashboard');
  return { success: true };
}
