'use server';

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface Workflow {
  id: string;
  user_id: string;
  strategic_insight_id: string;
  content_type: 'educational' | 'behind_the_scenes' | 'promotional' | 'interactive';
  project_name: string;
  current_phase: number;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  phase_data: any;
  created_at: string;
  updated_at: string;
}

const CONTENT_TYPE_LABELS = {
  educational: 'Educational',
  behind_the_scenes: 'Behind-the-Scenes',
  promotional: 'Promotional',
  interactive: 'Interactive',
};

/**
 * Create a new content workflow
 */
export async function createWorkflow(
  insightId: string,
  contentType: 'educational' | 'behind_the_scenes' | 'promotional' | 'interactive'
) {
  const supabase = await createClient();

  try {
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const userId = user.id;

    // Fetch the strategic insight to get the trend title
    const { data: insight, error: insightError } = await supabase
      .from('strategic_insights')
      .select('trend_title')
      .eq('id', insightId)
      .single();

    if (insightError || !insight) {
      throw new Error('Strategic insight not found');
    }

    // Generate project name
    const contentTypeLabel = CONTENT_TYPE_LABELS[contentType];
    const projectName = `${insight.trend_title} - ${contentTypeLabel}`;

    // Create the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('content_workflows')
      .insert({
        user_id: userId,
        strategic_insight_id: insightId,
        content_type: contentType,
        project_name: projectName,
        current_phase: 1,
        status: 'in_progress',
        phase_data: {
          phase1: {},
          phase2: {},
          phase3: {},
          phase4: {},
        },
      })
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Failed to create workflow: ${workflowError.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/lab');

    return workflow;
  } catch (error: any) {
    console.error('Workflow creation failed:', error);
    throw new Error(`Failed to create workflow: ${error.message}`);
  }
}

/**
 * Get a workflow by ID
 */
export async function getWorkflow(workflowId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('content_workflows')
    .select('*, strategic_insights(trend_title, content_ideas, trend_id)')
    .eq('id', workflowId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching workflow:', error);
    return null;
  }

  return data;
}

/**
 * Get all workflows for a user
 */
export async function getUserWorkflows(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('content_workflows')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }

  return data;
}

/**
 * Update workflow phase and data
 */
export async function updateWorkflowPhase(
  workflowId: string,
  userId: string,
  phase: number,
  phaseData: any
) {
  const supabase = await createClient();

  try {
    // Get current workflow
    const { data: workflow, error: fetchError } = await supabase
      .from('content_workflows')
      .select('phase_data')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !workflow) {
      throw new Error('Workflow not found');
    }

    // Update phase data
    const updatedPhaseData = {
      ...workflow.phase_data,
      [`phase${phase}`]: phaseData,
    };

    // Update workflow
    const { data: updatedWorkflow, error: updateError } = await supabase
      .from('content_workflows')
      .update({
        current_phase: phase,
        phase_data: updatedPhaseData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update workflow: ${updateError.message}`);
    }

    revalidatePath('/lab');
    revalidatePath(`/lab/workflow/${workflowId}`);

    return updatedWorkflow;
  } catch (error: any) {
    console.error('Workflow update failed:', error);
    throw new Error(`Failed to update workflow: ${error.message}`);
  }
}

/**
 * Save workflow draft
 */
export async function saveWorkflowDraft(
  workflowId: string,
  userId: string,
  phaseData: any
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('content_workflows')
      .update({
        phase_data: phaseData,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save draft: ${error.message}`);
    }

    revalidatePath('/lab');
    revalidatePath(`/lab/workflow/${workflowId}`);

    return data;
  } catch (error: any) {
    console.error('Draft save failed:', error);
    throw new Error(`Failed to save draft: ${error.message}`);
  }
}

/**
 * Get user products
 */
export async function getUserProducts(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user case studies
 */
export async function getUserCaseStudies(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching case studies:', error);
    return [];
  }

  return data || [];
}

/**
 * Save workflow asset
 */
export async function saveWorkflowAsset(
  workflowId: string,
  assetType: string,
  content: string,
  metadata: any = {}
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('workflow_assets')
      .insert({
        workflow_id: workflowId,
        asset_type: assetType,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save asset: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Asset save failed:', error);
    throw new Error(`Failed to save asset: ${error.message}`);
  }
}

/**
 * Get workflow assets
 */
export async function getWorkflowAssets(workflowId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workflow_assets')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }

  return data || [];
}
