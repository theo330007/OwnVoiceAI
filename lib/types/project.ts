export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';
export type ProjectStep = 'setup' | 'research' | 'planning' | 'execution' | 'review';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  selected_trends: string[]; // UUID array
  content_ideas: any[];
  validation_results: any[];
  current_step: ProjectStep;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  selected_trends?: string[];
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  selected_trends?: string[];
  content_ideas?: any[];
  validation_results?: any[];
  current_step?: ProjectStep;
  metadata?: Record<string, any>;
}

export interface SavedContentIdea {
  id: string;
  user_id: string;
  project_id: string | null;
  trend_id: string | null;
  title: string;
  description: string | null;
  hook: string | null;
  content_format: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateContentIdeaInput {
  title: string;
  description?: string;
  hook?: string;
  content_format?: string;
  notes?: string;
  project_id?: string;
  trend_id?: string;
}
