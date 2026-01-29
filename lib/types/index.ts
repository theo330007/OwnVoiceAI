export type TrendLayer = 'macro' | 'niche';

export interface Trend {
  id: string;
  layer: TrendLayer;
  trend_type: string;
  title: string;
  description: string | null;
  source_url: string | null;
  keywords: string[];
  relevance_score: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  source: string | null;
  source_url: string | null;
  topic_tags: string[];
  similarity?: number;
  created_at: string;
}

export interface ValidationResult {
  relevance_score: number;
  trend_alignment: {
    macro_trends: string[];
    niche_trends: string[];
    alignment_reasoning: string;
  };
  scientific_anchor: {
    sources: Array<{ title: string; url: string }>;
    key_findings: string;
    credibility_score: number;
  };
  refined_hooks: string[];
  additional_notes?: string;
}

export interface Validation {
  id: string;
  user_query: string;
  relevance_score: number;
  trend_alignment: any;
  scientific_anchor: any;
  refined_hooks: any;
  conversation_history: any;
  created_at: string;
}
