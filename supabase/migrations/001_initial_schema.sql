-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Trends table (Layer 1: Macro, Layer 2: Niche)
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer TEXT NOT NULL CHECK (layer IN ('macro', 'niche')),
  trend_type TEXT NOT NULL, -- 'wellness', 'fertility', 'nutrition', etc.
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  keywords TEXT[],
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trends_layer ON trends(layer);
CREATE INDEX idx_trends_created ON trends(created_at DESC);
CREATE INDEX idx_trends_keywords ON trends USING GIN(keywords);

-- Knowledge base with vector embeddings
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT, -- 'PubMed', 'NIH', 'Research Journal'
  source_url TEXT,
  topic_tags TEXT[], -- ['fertility', 'nutrition', 'stress']
  embedding vector(768), -- Gemini embeddings (768 dims)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_tags ON knowledge_base USING GIN(topic_tags);
CREATE INDEX idx_knowledge_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Validation history
CREATE TABLE validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query TEXT NOT NULL,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 100),
  trend_alignment JSONB,
  scientific_anchor JSONB,
  refined_hooks JSONB,
  conversation_history JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validations_created ON validations(created_at DESC);

-- Strategies (Layer 3 - deferred to Phase 2)
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  macro_trends UUID[],
  niche_trends UUID[],
  scientific_anchors UUID[],
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC Function: Vector similarity search
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  source text,
  source_url text,
  topic_tags text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.source,
    kb.source_url,
    kb.topic_tags,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RPC Function: Get latest trends by layer
CREATE OR REPLACE FUNCTION get_latest_trends(
  trend_layer text DEFAULT 'macro',
  limit_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  keywords text[],
  relevance_score integer,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.keywords,
    t.relevance_score,
    t.created_at
  FROM trends t
  WHERE t.layer = trend_layer
  ORDER BY t.created_at DESC
  LIMIT limit_count;
END;
$$;
