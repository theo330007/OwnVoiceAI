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

export async function* validateContentIdea(userQuery: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: [{ functionDeclarations: tools as any }],
    systemInstruction: `You are OwnVoice AI, a boutique wellness content validation agent for wellness entrepreneurs.

Your role is to help validate content ideas by:
1. Analyzing relevance to current wellness trends (macro and niche)
2. Finding scientific anchors to ground claims
3. Providing a relevance score (1-100)
4. Suggesting 3 refined hook variations optimized for viral reach

You have access to these tools:
- search_knowledge_base: Search scientific research and studies in the knowledge base
- get_latest_trends: Retrieve current macro and niche wellness trends

WORKFLOW:
1. First, call get_latest_trends for both 'macro' and 'niche' layers to understand current trends
2. Then, call search_knowledge_base with relevant keywords from the user's content idea
3. Analyze the data and provide your validation

CRITICAL: Your final response MUST be valid JSON with this exact structure:
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

Be specific, actionable, and data-driven in your recommendations.`,
  });

  const chat = model.startChat();
  let result = await chat.sendMessageStream(userQuery);

  for await (const chunk of result.stream) {
    const functionCalls = chunk.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      // Execute function calls
      const functionResponses = await Promise.all(
        functionCalls.map(async (fc) => {
          try {
            const response = await executeTool(fc);
            return {
              name: fc.name,
              response: { result: response },
            };
          } catch (error: any) {
            return {
              name: fc.name,
              response: { error: error.message },
            };
          }
        })
      );

      // Send function results back to model
      result = await chat.sendMessageStream(functionResponses);

      // Continue streaming the response
      for await (const responseChunk of result.stream) {
        const text = responseChunk.text();
        if (text) {
          yield { type: 'text', content: text };
        }
      }
    } else {
      const text = chunk.text();
      if (text) {
        yield { type: 'text', content: text };
      }
    }
  }
}
