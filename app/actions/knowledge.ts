'use server';

import { createClient } from '@/lib/supabase';
import { vectorService } from '@/lib/services/vector.service';
import type { KnowledgeBase } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getAllKnowledge(): Promise<KnowledgeBase[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, title, content, source, source_url, topic_tags, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge:', error);
    return [];
  }

  return data as KnowledgeBase[];
}

export async function addKnowledge(knowledge: {
  title: string;
  content: string;
  source: string;
  source_url: string;
  topic_tags: string[];
}) {
  const data = await vectorService.addKnowledge(
    knowledge.title,
    knowledge.content,
    knowledge.source,
    knowledge.source_url,
    knowledge.topic_tags
  );

  revalidatePath('/admin/knowledge');

  return data;
}

export async function deleteKnowledge(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('knowledge_base').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete knowledge: ${error.message}`);
  }

  revalidatePath('/admin/knowledge');
}

export async function searchKnowledge(query: string, limit = 10) {
  const results = await vectorService.searchKnowledgeBase(query, 0.7, limit);
  return results;
}
