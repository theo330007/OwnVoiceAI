import { createClient, createServiceClient } from '@/lib/supabase';
import { gemini } from './gemini.service';

export class VectorService {
  async searchKnowledgeBase(
    query: string,
    matchThreshold = 0.7,
    matchCount = 10
  ) {
    const supabase = await createClient();
    const embedding = await gemini.generateEmbedding(query);

    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) throw error;
    return data;
  }

  async addKnowledge(
    title: string,
    content: string,
    source: string,
    sourceUrl: string,
    topicTags: string[]
  ) {
    const supabase = createServiceClient();
    const embedding = await gemini.generateEmbedding(content);

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        title,
        content,
        source,
        source_url: sourceUrl,
        topic_tags: topicTags,
        embedding,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const vectorService = new VectorService();
