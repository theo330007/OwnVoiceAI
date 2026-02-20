import {
  GoogleGenerativeAI,
  SchemaType,
} from '@google/generative-ai';
import { vectorService } from '@/lib/services/vector.service';
import { createClient } from '@/lib/supabase';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing env.GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tools = [
  {
    name: 'search_knowledge_base',
    description:
      'Search the scientific knowledge base for relevant research, studies, and scientific anchors related to wellness topics.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'The search query to find relevant scientific information',
        },
        match_threshold: {
          type: SchemaType.NUMBER,
          description: 'Similarity threshold (0-1). Default 0.7',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Maximum number of results. Default 10',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_latest_trends',
    description:
      'Retrieve the latest wellness trends from both macro and niche layers.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        layer: {
          type: SchemaType.STRING,
          description: 'Which trend layer to retrieve: macro or niche',
          enum: ['macro', 'niche'],
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Number of trends to retrieve. Default 20',
        },
      },
      required: ['layer'],
    },
  },
];

async function executeTool(functionCall: any) {
  const { name, args } = functionCall;

  if (name === 'search_knowledge_base') {
    return await vectorService.searchKnowledgeBase(
      args.query,
      args.match_threshold || 0.7,
      args.limit || 10
    );
  }

  if (name === 'get_latest_trends') {
    const supabase = await createClient();
    const { data } = await supabase.rpc('get_latest_trends', {
      trend_layer: args.layer,
      limit_count: args.limit || 20,
    });
    return data;
  }

  throw new Error(`Unknown function: ${name}`);
}

function buildSystemInstruction(userProfile?: Record<string, any>): string {
  let profileBlock = '';
  if (userProfile) {
    const fields: string[] = [];
    if (userProfile.name) fields.push(`Name: ${userProfile.name}`);
    if (userProfile.industries?.length) fields.push(`Industries: ${userProfile.industries.join(', ')}`);
    if (userProfile.tone) fields.push(`Tone & Voice: ${userProfile.tone}`);
    if (userProfile.niche) fields.push(`Niche: ${userProfile.niche}`);
    if (userProfile.target_audience) fields.push(`Target Audience: ${userProfile.target_audience}`);
    if (userProfile.core_belief) fields.push(`Core Belief: ${userProfile.core_belief}`);
    if (userProfile.positioning) fields.push(`Positioning: ${userProfile.positioning}`);
    if (userProfile.offering) fields.push(`Offering: ${userProfile.offering}`);
    if (userProfile.brand_words?.length) fields.push(`Brand Words: ${userProfile.brand_words.join(', ')}`);
    if (fields.length > 0) {
      profileBlock = `[CREATOR PROFILE — tailor ALL responses specifically to this person]
${fields.join('\n')}

`;
    }
  }

  return `${profileBlock}You are OwnVoice AI, a boutique wellness content validation agent for wellness entrepreneurs.

Your role is to help validate content ideas by:
1. Analyzing relevance to current wellness trends (macro and niche)
2. Finding scientific anchors to ground claims
3. Providing a relevance score (1-100)
4. Suggesting 3 refined hook variations optimized for viral reach

${userProfile?.niche ? `Always frame hooks and recommendations specifically for someone in the "${userProfile.niche}" space with a "${userProfile.tone || 'expert'}" tone targeting "${userProfile.target_audience || 'their audience'}".` : ''}

You have access to these tools:
- search_knowledge_base: Search scientific research and studies in the knowledge base
- get_latest_trends: Retrieve current macro and niche wellness trends

WORKFLOW:
1. First, call get_latest_trends for both 'macro' and 'niche' layers to understand current trends
2. Then, call search_knowledge_base with relevant keywords from the user's content idea
3. Analyze the data and provide your validation

CRITICAL: Your final response MUST be valid JSON with this exact structure (no markdown fences, raw JSON only):
{
  "relevance_score": <1-100>,
  "trend_alignment": {
    "macro_trends": ["trend 1", "trend 2"],
    "niche_trends": ["trend 1", "trend 2"],
    "alignment_reasoning": "Explain how the content aligns with these trends"
  },
  "scientific_anchor": {
    "sources": [{"title": "Study title", "url": "https://..."}],
    "key_findings": "Summary of the most relevant scientific findings",
    "credibility_score": <1-100>
  },
  "refined_hooks": [
    "Hook variation 1 - optimized for engagement",
    "Hook variation 2 - different angle",
    "Hook variation 3 - unique perspective"
  ],
  "additional_notes": "Any other strategic insights or recommendations"
}

Be specific, actionable, and data-driven in your recommendations.`;
}

export async function* validateContentIdea(
  userQuery: string,
  userProfile?: Record<string, any>,
  conversationHistory?: { role: string; content: string }[]
) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [{ functionDeclarations: tools as any }],
    systemInstruction: buildSystemInstruction(userProfile),
  });

  // Map prior conversation history to Gemini format
  const history = (conversationHistory || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const chat = model.startChat({ history });

  // Agentic loop using sendMessageStream every round:
  // - For tool-call rounds: stream completes with no text, we read function calls
  //   from the aggregated response and execute them
  // - For the final round: text chunks stream in immediately, ending the spinner
  let currentQuery: any = userQuery;

  for (let round = 0; round < 7; round++) {
    const streamResult = await chat.sendMessageStream(currentQuery);

    // Stream any text chunks as they arrive (only happens on the final round)
    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        yield { type: 'text', content: text };
      }
    }

    // After the stream is fully consumed, check the aggregated response for function calls
    const aggregated = await streamResult.response;
    const functionCalls = aggregated.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      // No function calls in this round — text was already streamed, we're done
      break;
    }

    // Emit a status event for each tool call so the UI shows progress
    for (const fc of functionCalls) {
      const statusMsg =
        fc.name === 'get_latest_trends'
          ? `Fetching ${(fc.args as any).layer} wellness trends…`
          : `Searching scientific knowledge base…`;
      yield { type: 'status', content: statusMsg };
    }

    // Execute all tool calls in parallel
    const functionResponses = await Promise.all(
      functionCalls.map(async (fc) => {
        try {
          const result = await executeTool(fc);
          return { name: fc.name, response: { result } };
        } catch (error: any) {
          return { name: fc.name, response: { error: error.message } };
        }
      })
    );

    // Feed results back as the next query
    currentQuery = functionResponses as any;
  }
}
