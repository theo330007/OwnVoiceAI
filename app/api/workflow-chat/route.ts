import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type ContentUpdate = {
  scene_update?: { index: number; visual: string; audio: string; assets?: any[] };
  script?: { scenes: any[] };
  hookVariations?: { type: string; hook: string }[];
  bRollShotList?: { title: string; description: string; camera_angle: string; vibe_tag: string; duration: string }[];
};

function buildModificationSystemInstruction(context: any, currentContent: any): string {
  const { script, hookVariations, bRollShotList } = currentContent;

  const scenesText = script?.scenes
    ?.map((s: any, i: number) => `Scene ${i + 1}: Visual: ${s.visual} | Copy: ${s.audio}`)
    .join('\n') || 'No scenes yet';

  const hooksText = hookVariations?.length
    ? hookVariations.map((h: any) => `${h.type}: ${h.hook}`).join('\n')
    : 'No hook variations yet';

  const brollText = bRollShotList?.length
    ? bRollShotList.map((b: any) => `${b.title}: ${b.description}`).join('\n')
    : 'No B-roll shots yet';

  return `You are OwnVoice AI Assistant, a content editor helping refine a wellness content workflow.

PROJECT CONTEXT:
- Project: ${context.projectName}
- Content Type: ${context.contentType}
- Trend: ${context.trendTitle}
- Hook: ${context.contentIdea?.hook || 'N/A'}
- Concept: ${context.contentIdea?.concept || 'N/A'}

USER'S BUSINESS CONTEXT:
- Products: ${context.products?.length > 0 ? context.products.map((p: any) => `${p.name}: ${p.description}`).join('; ') : 'None'}
- Brand Style: ${context.brandStyle || 'Not defined'}
- Brand Voice: ${context.brandVoice || 'Not defined'}

CURRENT PHASE 2 CONTENT:
Script (${script?.scenes?.length || 0} scenes):
${scenesText}

Hook Variations:
${hooksText}

B-Roll Shot List:
${brollText}

YOUR ROLE:
You can both advise on content strategy AND directly edit the content above.

RESPONSE FORMAT — always return valid JSON:
{
  "message": "Natural explanation of what you've done or are recommending. Be concise and specific.",
  "hasUpdates": false,
  "updates": null
}

When making content changes, return:
{
  "message": "Brief explanation of what you changed and why",
  "hasUpdates": true,
  "updates": {
    "scene_update"?: { "index": <0-based scene number>, "visual": "...", "audio": "..." },
    "script"?: { "scenes": [{ "visual": "...", "audio": "...", "assets": [...] }] },
    "hookVariations"?: [{ "type": "Viral Reach", "hook": "..." }, { "type": "Community Trust", "hook": "..." }, { "type": "Direct Value", "hook": "..." }],
    "bRollShotList"?: [{ "title": "...", "description": "...", "camera_angle": "...", "vibe_tag": "...", "duration": "..." }]
  }
}

RULES:
- Be SURGICAL: for single-scene changes, use scene_update (not the full script)
- Use script only when changes span multiple scenes or restructure the whole flow
- When updating scenes, always preserve the existing assets array unless asked to change it
- hookVariations must always contain all 3 variations (Viral Reach, Community Trust, Direct Value)
- If the user asks a question or wants advice without changing anything, set hasUpdates: false
- Always respond in the same language as the user's message`;
}

function buildConversationalSystemInstruction(context: any): string {
  return `You are OwnVoice AI Assistant, helping a wellness content creator with their content workflow.

CURRENT PROJECT CONTEXT:
- Project Name: ${context.projectName}
- Content Type: ${context.contentType}
- Trend: ${context.trendTitle}
- Current Phase: ${context.currentPhase} of 4

CONTENT IDEA:
- Hook: ${context.contentIdea?.hook || 'N/A'}
- Concept: ${context.contentIdea?.concept || 'N/A'}
- CTA: ${context.contentIdea?.cta || 'N/A'}

USER'S BUSINESS CONTEXT:
- Products: ${context.products?.length > 0 ? context.products.map((p: any) => `${p.name}: ${p.description}`).join('; ') : 'None added yet'}
- Case Studies: ${context.caseStudies?.length > 0 ? context.caseStudies.map((c: any) => `${c.title}: ${c.results}`).join('; ') : 'None added yet'}
- Brand Style: ${context.brandStyle || 'Not defined yet'}
- Brand Voice: ${context.brandVoice || 'Not defined yet'}

PHASE DATA:
${JSON.stringify(context.phaseData, null, 2)}

YOUR ROLE:
1. Help the user navigate the current phase
2. Answer questions about their content strategy
3. Suggest improvements to hooks, scripts, or concepts
4. Provide context-aware recommendations based on their products/case studies
5. Guide them through the workflow steps

CURRENT PHASE GUIDANCE:
${getPhaseGuidance(context.currentPhase)}

Be concise, helpful, and actionable. Reference their specific business context when relevant.`;
}

export async function POST(req: NextRequest) {
  const { query, context, conversationHistory, currentContent } = await req.json();

  const encoder = new TextEncoder();

  // Modification mode: Phase 2 with generated content
  const isModificationMode = !!currentContent?.script;

  if (isModificationMode) {
    // Non-streaming JSON mode for reliable structured output
    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (data: object) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        try {
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: buildModificationSystemInstruction(context, currentContent),
          });

          // Build conversation history for context
          const chatHistory = (conversationHistory || [])
            .filter((m: any) => m.role === 'user' || m.role === 'assistant')
            .map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            }));

          const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
              responseMimeType: 'application/json',
              maxOutputTokens: 4096,
              temperature: 0.7,
            },
          });

          const result = await chat.sendMessage(query);
          const rawText = result.response.text();

          let parsed: { message: string; hasUpdates: boolean; updates: ContentUpdate | null };
          try {
            parsed = JSON.parse(rawText);
          } catch {
            // Fallback: extract JSON from the response
            const match = rawText.match(/\{[\s\S]*\}/);
            parsed = match
              ? JSON.parse(match[0])
              : { message: rawText, hasUpdates: false, updates: null };
          }

          // Emit the conversational message
          enqueue({ type: 'text', content: parsed.message || rawText });

          // Emit content updates if any
          if (parsed.hasUpdates && parsed.updates) {
            enqueue({ type: 'content_update', content: parsed.updates });
          }

          controller.close();
        } catch (error) {
          console.error('Workflow chat modification error:', error);
          enqueue({ type: 'text', content: 'Sorry, I had trouble processing that request. Please try again.' });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  // Conversational mode: existing streaming approach
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: buildConversationalSystemInstruction(context),
        });

        const chatHistory = (conversationHistory || [])
          .filter((m: any) => m.role === 'user' || m.role === 'assistant')
          .map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          }));

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessageStream(query);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            const data = `data: ${JSON.stringify({ type: 'text', content: text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }

        controller.close();
      } catch (error) {
        console.error('Workflow chat error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

function getPhaseGuidance(phase: number): string {
  switch (phase) {
    case 1:
      return `Phase 1: Contextual Brief
- Help user decide if they should adapt content to a specific product or case study
- Guide them on providing additional context
- Suggest how to align the content idea with their business reality`;
    case 2:
      return `Phase 2: Asset Orchestration
- Help review and improve generated scripts
- Suggest better hook variations
- Provide feedback on B-roll shots
- Improve visual board prompts for their brand style`;
    case 3:
      return `Phase 3: OwnVoice Guardrail
- Science verification and compliance checking
- Tone alignment with brand voice
- Fact-checking against scientific anchors`;
    case 4:
      return `Phase 4: Scheduling & Hand-off
- Help with content calendar planning
- Export and scheduling guidance
- Final review before publishing`;
    default:
      return 'General workflow guidance';
  }
}
