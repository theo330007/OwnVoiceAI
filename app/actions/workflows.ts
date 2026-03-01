'use server';

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

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
 * Create a workflow from an existing idea-based project (no strategic insight)
 */
export async function createWorkflowFromProject(projectId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const supabase = await createClient();

  // Fetch the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (projectError || !project) {
    throw new Error('Project not found');
  }

  // Create the workflow pre-seeded with the project's idea content
  const { data: workflow, error: workflowError } = await supabase
    .from('content_workflows')
    .insert({
      user_id: user.id,
      strategic_insight_id: null,
      content_type: project.content_type,
      project_name: project.title,
      current_phase: 1,
      status: 'in_progress',
      phase_data: {
        phase1: {
          hook: project.hook || '',
          concept: project.concept || '',
          cta: project.cta || '',
          trend_title: project.trend_title || '',
        },
        phase2: {},
        phase3: {},
        phase4: {},
      },
    } as any)
    .select()
    .single();

  if (workflowError) {
    throw new Error(`Failed to create workflow: ${workflowError.message}`);
  }

  // Link the workflow back to the project
  await supabase
    .from('projects')
    .update({ workflow_id: workflow.id, completion_percentage: 10 })
    .eq('id', projectId)
    .eq('user_id', user.id);

  revalidatePath('/projects');
  revalidatePath('/lab');

  return workflow as Workflow;
}

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

    // Fetch the strategic insight to get the trend title and content ideas
    const { data: insight, error: insightError } = await supabase
      .from('strategic_insights')
      .select('trend_title, content_ideas')
      .eq('id', insightId)
      .single();

    if (insightError || !insight) {
      throw new Error('Strategic insight not found');
    }

    // Generate project name
    const contentTypeLabel = CONTENT_TYPE_LABELS[contentType];
    const projectName = `${insight.trend_title} - ${contentTypeLabel}`;

    // Get the specific content idea for this content type
    const contentIdea = insight.content_ideas?.[contentType];

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

    // Create a corresponding project for tracking
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        workflow_id: workflow.id,
        strategic_insight_id: insightId,
        title: projectName,
        description: `Content creation project for ${contentTypeLabel.toLowerCase()} content`,
        content_type: contentType,
        trend_title: insight.trend_title,
        status: 'in_progress',
        current_phase: 'ideation',
        completion_percentage: 10,
        hook: contentIdea?.hook || null,
        concept: contentIdea?.concept || null,
        cta: contentIdea?.cta || null,
      })
      .select()
      .single();

    if (projectError) {
      console.error('Failed to create project:', projectError);
      // Don't throw - workflow is already created, project is just for tracking
    }

    revalidatePath('/dashboard');
    revalidatePath('/lab');
    revalidatePath('/projects');

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

/**
 * Generate production assets (server-side Gemini call)
 */
export async function generateProductionAssets(input: {
  trendTitle: string;
  contentIdea: { hook: string; concept: string; cta: string };
  contextInfo: string;
  brandStyle: string;
  contentFormat?: string;
  toneStyle?: string;
  contentAngle?: string;
  refinementContext?: string;
  contentPillars?: { title: string; description: string }[];
  positioning?: string;
  tone?: string;
}) {
  try {
    const geminiService = (await import('@/lib/services/gemini.service')).gemini;

    const formatLabel = input.contentFormat === 'carousel' ? 'Instagram Carousel' : input.contentFormat === 'story' ? 'Instagram Story' : 'Instagram Reel/TikTok';
    const toneLabel = input.toneStyle === 'bold' ? 'Bold & Provocative - challenge assumptions, spark debate' : input.toneStyle === 'storytelling' ? 'Storytelling - personal narrative, emotional connection' : 'Educational - teach and inform with authority';
    const angleLabel = input.contentAngle === 'personal_story' ? 'Personal Story - share a personal experience tied to the trend' : input.contentAngle === 'trend_commentary' ? 'Trend Commentary - react to the trend with expertise' : 'Direct Value - lead with actionable tips and takeaways';

    // Build format-specific prompt sections
    const isCarousel = input.contentFormat === 'carousel';
    const isStory = input.contentFormat === 'story';

    const scriptInstruction = isCarousel
      ? `1. **Slide-by-Slide Script** (for Instagram Carousel, up to 10 slides):
   - Left column ("visual"): Design direction for the slide (layout, imagery, colors, typography style)
   - Right column ("audio"): The actual text/copy that goes on the slide
   - First slide must be a scroll-stopping hook slide
   - Last slide must be a clear CTA slide
   - Make each slide self-contained yet part of a narrative flow`
      : isStory
      ? `1. **Story Sequence** (for Instagram Stories, 5-7 frames):
   - Left column ("visual"): What to show/film for this story frame (camera angle, setup)
   - Right column ("audio"): Text overlay, voiceover, or sticker text for this frame
   - Keep each frame punchy (under 15 seconds)
   - Include interactive elements (polls, questions, sliders) where relevant`
      : `1. **Dual-Column Script** (for Instagram Reel/TikTok, 5-7 scenes):
   - Left column ("visual"): Visual cues — what to film, camera movement, framing
   - Right column ("audio"): Voiceover script or on-screen captions
   - Make it actionable and specific for a ${input.toneStyle === 'bold' ? 'punchy, fast-paced' : input.toneStyle === 'storytelling' ? 'narrative, emotionally-paced' : 'clear, well-structured'} delivery`;

    const shotListInstruction = isCarousel
      ? `2. **Slide Visual Guidelines** (5 design directions):
   Generate exactly 5 visual guidelines for carousel slide design.

   Design Constraints:
   - Aesthetic: Clean layouts, consistent color palette, readable typography, branded feel
   - Mix: Cover slide, data/stat slides, quote slides, process slides, CTA slide

   Each guideline must include:
   - title: Name of the slide type (e.g., "Hook Cover Slide", "Data Point Slide")
   - description: Detailed design instruction (colors, fonts, layout, imagery)
   - camera_angle: Design style (e.g., "Centered Layout", "Split Grid", "Full Bleed Image")
   - vibe_tag: Purpose of this slide (e.g., "Hook", "Authority", "Social Proof", "CTA")
   - duration: Slide position (e.g., "Slide 1", "Slides 3-4")`
      : isStory
      ? `2. **Supporting Shots** (5 complementary shots):
   Generate exactly 5 quick supporting shots for the story series.

   Constraints:
   - Keep shots raw and authentic (stories feel personal, not overly produced)
   - Mix of selfie-style, POV, and environmental shots
   - Each shot should be 3-8 seconds max

   Each shot must include:
   - title: Short name of the shot
   - description: Quick visual instruction (casual, authentic feel)
   - camera_angle: (Selfie, POV, Overhead, Close-up, etc.)
   - vibe_tag: Mood tag (Behind-the-scenes, Authentic, Quick-tip, Interactive)
   - duration: Recommended seconds (e.g., "3-5s")`
      : `2. **B-Roll Shot List** (5 cinematic shots):
   Generate exactly 5 shots that blend high-end aesthetic with credibility, aligned to the brand's visual style.

   Visual Constraints:
   - Aesthetic: Match the brand style described above. Use depth of field, natural lighting, and premium textures.
   - Framing: Mix of Macro (detail), Eye-level (connection), and Overhead (process)

   Shot Selection Logic:
   - 2 Sensory Shots: Focus on textures, products, or environment details
   - 2 Authority Shots: Focus on the work, expertise, or process
   - 1 Connection Shot: The creator in their environment

   Each shot must include:
   - title: Short name of the shot
   - description: Detailed visual instruction (lighting, movement)
   - camera_angle: (Macro, Top-down, Eye-level, etc.)
   - vibe_tag: Why this shot matters (Sensory, Authority, Relatability)
   - duration: Recommended seconds (e.g., "3-5s")`;

    const hookInstruction = isCarousel
      ? `3. **A/B Hook Testing** (3 first-slide headline variations):
   - Variation A: Viral Reach (scroll-stopping, curiosity-driven headline)
   - Variation B: Community Trust (relatable, "me too" headline)
   - Variation C: Direct Value (clear benefit, "you'll learn" headline)`
      : isStory
      ? `3. **A/B Hook Testing** (3 opening story frame variations):
   - Variation A: Viral Reach (bold text overlay that demands a tap)
   - Variation B: Community Trust (casual, authentic opening frame)
   - Variation C: Direct Value (clear promise of what's coming in the next frames)`
      : `3. **A/B Hook Testing** (3 opening line variations):
   - Variation A: Viral Reach (algorithm-optimized, bold claim)
   - Variation B: Community Trust (authentic, relatable)
   - Variation C: Direct Value (clear benefit, educational)`;

    const aspectRatio = isCarousel ? '1:1' : '9:16';

    const assetInstruction = isCarousel
      ? `5. **Production Assets per Slide**:
   For EACH slide in the script, generate a list of required production assets.
   Typical assets per slide:
   - 1-2 images (background texture, product photo, lifestyle shot, graphic/icon overlay)

   Each asset must include:
   - id: Unique ID following pattern "scene-{slideNumber}-{type}-{purpose}" (e.g., "scene-1-image-background")
   - type: MUST be exactly one of "image", "video", or "audio" — no other values are valid
   - description: Human-readable description of what this asset is
   - generationPrompt: AI-optimized prompt for image/video generation tools (detailed, descriptive, include style keywords and aspect ratio ${aspectRatio})
   - usage: How this asset is used (e.g., "Slide background", "Product overlay", "Texture layer")`
      : isStory
      ? `5. **Production Assets per Frame**:
   For EACH story frame in the script, generate a list of required production assets.
   Typical assets per frame:
   - 1 image or 1 short video clip (background, selfie-style, POV)
   - Optional: background music or sound effect

   Each asset must include:
   - id: Unique ID following pattern "scene-{frameNumber}-{type}-{purpose}" (e.g., "scene-1-video-background")
   - type: "image" | "video" | "audio"
   - description: Human-readable description of what this asset is
   - generationPrompt: AI-optimized prompt for image/video/audio generation tools (detailed, descriptive, include style keywords and aspect ratio ${aspectRatio})
   - usage: How this asset is used (e.g., "Frame background", "B-roll clip", "Ambient sound")`
      : `5. **Production Assets per Scene**:
   For EACH scene in the script, generate a list of required production assets.
   Typical assets per scene:
   - 1 video clip OR 1 image (B-roll, product shot, lifestyle footage)
   - Optional: background music track, sound effect, or voiceover segment

   Each asset must include:
   - id: Unique ID following pattern "scene-{sceneNumber}-{type}-{purpose}" (e.g., "scene-1-video-broll")
   - type: "image" | "video" | "audio"
   - description: Human-readable description of what this asset is
   - generationPrompt: AI-optimized prompt for image/video/audio generation tools (detailed, descriptive, include style keywords and aspect ratio ${aspectRatio})
   - usage: How this asset is used (e.g., "B-roll footage", "Background image", "Ambient track")`;

    const prompt = `You are an Expert Content Director${input.brandStyle ? ` for a brand with this style: ${input.brandStyle}` : ' for professional social media content'}.

TREND: ${input.trendTitle}

CONTENT CONCEPT:
Hook: ${input.contentIdea.hook}
Concept: ${input.contentIdea.concept}
CTA: ${input.contentIdea.cta}

CONTENT FORMAT: ${formatLabel}
TONE & STYLE: ${toneLabel}
CONTENT ANGLE: ${angleLabel}

${input.contextInfo ? `BUSINESS CONTEXT:\n${input.contextInfo}\n` : ''}

VISUAL STYLE: ${input.brandStyle || 'Clean, professional aesthetic with consistent visual identity'}

Generate the following assets. IMPORTANT: Tailor ALL content specifically for the ${formatLabel} format with a ${input.toneStyle || 'educational'} tone and ${angleLabel} approach.
${input.refinementContext ? `
REFINEMENT INSTRUCTIONS (from user feedback conversation — apply these changes to the regenerated assets):
${input.refinementContext}
` : ''}

${scriptInstruction}

${shotListInstruction}

${hookInstruction}

${assetInstruction}

ASSET GENERATION GUIDELINES:
- ALL generation prompts must align with the brand's visual style described above
- If a Visual Identity / Charte Graphique is specified in the context, every image generationPrompt MUST reference it (colors, typography style, aesthetic)
- Use consistent aesthetic language across all prompts
- Specify aspect ratio ${aspectRatio} in all image/video prompts
- Make prompts detailed enough for AI image/video generators (Midjourney, DALL-E, Runway style)
- Include lighting, composition, mood, and color palette keywords

Return as JSON:
{
  "script": {
    "scenes": [
      {
        "visual": "...",
        "audio": "...",
        "assets": [
          {
            "id": "scene-1-image-background",
            "type": "image",
            "description": "...",
            "generationPrompt": "...",
            "usage": "..."
          }
        ]
      }
    ]
  },
  "shot_list": [
    {
      "title": "...",
      "description": "...",
      "camera_angle": "...",
      "vibe_tag": "...",
      "duration": "..."
    }
  ],
  "hook_variations": [
    {"type": "Viral Reach", "hook": "..."},
    {"type": "Community Trust", "hook": "..."},
    {"type": "Direct Value", "hook": "..."}
  ]
}`;

    const response = await geminiService.generateText(prompt);

    // Parse JSON - strip markdown code blocks
    let jsonStr = response.trim();
    const codeBlockStart = '`' + '`' + '`';
    if (jsonStr.startsWith(codeBlockStart)) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    }

    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Try parsing, if truncated try to repair by closing open brackets
    let assets;
    try {
      assets = JSON.parse(jsonStr);
    } catch {
      // Attempt to repair truncated JSON
      let repaired = jsonStr;
      // Remove trailing incomplete string/value
      repaired = repaired.replace(/,\s*"[^"]*$/, '');
      repaired = repaired.replace(/,\s*$/, '');
      // Count open brackets and close them
      const openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
      repaired += ']'.repeat(Math.max(0, openBrackets));
      repaired += '}'.repeat(Math.max(0, openBraces));
      assets = JSON.parse(repaired);
    }

    // Self-critique step: check script against content pillars
    let critiqueNotes: string | null = null;
    if (assets.script?.scenes?.length && input.contentPillars?.length) {
      try {
        const pillarsText = input.contentPillars
          .map((p) => `- ${p.title}${p.description ? `: ${p.description}` : ''}`)
          .join('\n');

        const critiquePrompt = `You are an editorial critic for a content creator's brand.

CREATOR CONTENT PILLARS:
${pillarsText}
${input.positioning ? `POSITIONING: ${input.positioning}` : ''}
${input.tone ? `BRAND TONE: ${input.tone}` : ''}

GENERATED SCRIPT SCENES:
${JSON.stringify(assets.script.scenes.map((s: any, i: number) => ({ scene: i + 1, audio: s.audio })))}

Your task:
1. Check each scene's audio/copy against the content pillars.
2. Rewrite ONLY scenes whose copy contradicts or ignores the pillars.
3. Return a JSON object with:
   - "scenes": array of { "index": <0-based>, "audio": "<corrected copy>" } for ONLY the scenes you changed (empty array if nothing changed)
   - "critique_notes": a 1-sentence summary of what was corrected (or "All scenes align with content pillars." if no changes)

Return ONLY valid JSON, no markdown.`;

        const critiqueResponse = await geminiService.generateText(critiquePrompt);
        let critiqueJson = critiqueResponse.trim().replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        const critiqueMatch = critiqueJson.match(/\{[\s\S]*\}/);
        if (critiqueMatch) {
          const critique = JSON.parse(critiqueMatch[0]);
          critiqueNotes = critique.critique_notes || null;
          if (critique.scenes?.length) {
            for (const fix of critique.scenes) {
              if (assets.script.scenes[fix.index]) {
                assets.script.scenes[fix.index].audio = fix.audio;
              }
            }
          }
        }
      } catch {
        // Critique is best-effort; never block generation if it fails
      }
    }

    return {
      script: assets.script,
      shot_list: assets.shot_list || [],
      hook_variations: assets.hook_variations || [],
      critique_notes: critiqueNotes,
    };
  } catch (error: any) {
    console.error('Production asset generation failed:', error);
    throw new Error(`Failed to generate assets: ${error.message}`);
  }
}
