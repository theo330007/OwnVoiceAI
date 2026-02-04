import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { query, context, conversationHistory } = await req.json();

  // Build system instruction with full context
  const systemInstruction = `You are OwnVoice AI Assistant, helping a wellness content creator with their content workflow.

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
- Products: ${context.products.length > 0 ? context.products.map((p: any) => `${p.name}: ${p.description}`).join('; ') : 'None added yet'}
- Case Studies: ${context.caseStudies.length > 0 ? context.caseStudies.map((c: any) => `${c.title}: ${c.results}`).join('; ') : 'None added yet'}
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
${getPhasGuidance(context.currentPhase)}

Be concise, helpful, and actionable. Reference their specific business context when relevant.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Build conversation history
        const chatHistory = conversationHistory.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
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

function getPhasGuidance(phase: number): string {
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
