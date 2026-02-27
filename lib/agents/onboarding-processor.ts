import { GoogleGenerativeAI } from '@google/generative-ai';
import type { OnboardingAnswers } from '@/lib/types/onboarding';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface StrategicProfile {
  // LLM-synthesized fields
  persona: string;
  niche: string;
  positioning: string;
  offering: string;
  competitors: string[];
  hot_news: string;
  // Direct from questionnaire (cleaned up by LLM)
  target_audience: string;
  transformation: string;
  tone: string;
  brand_words: string[];
  preferred_formats: string[];
  offer_types: string[];
  content_pillars: { title: string; description: string }[];
}

export async function processOnboardingAnswers(answers: OnboardingAnswers): Promise<StrategicProfile> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const contentPillarsText = answers.content_pillars?.length
    ? answers.content_pillars
        .filter((p) => p.title)
        .map((p) => `- ${p.title}: ${p.description || 'No description'}`)
        .join('\n')
    : 'Not specified';

  const prompt = `You are a strategic brand positioning expert for wellness and coaching entrepreneurs.

Analyze the following questionnaire answers and synthesize them into a comprehensive strategic brand profile.

## QUESTIONNAIRE ANSWERS

### Identity & Context
- Name: ${answers.first_name} ${answers.last_name}
- Business: ${answers.business_name}
- Website: ${answers.website}
- Social: Instagram ${answers.instagram}, TikTok ${answers.tiktok}
- Location: ${answers.country}
- Target Audience Region: ${answers.target_market}
- Niche Tags: ${answers.niche_tags?.join(', ') || 'Not specified'}

### Offer & Business Model
- Offer types: ${answers.offer_type?.join(', ') || 'Not specified'}
- Main offer: ${answers.offer_description}

### Strategic Positioning
- Problem solved: ${answers.problem_solved}
- Target audience: ${answers.target_audience}
- Transformation promised: ${answers.transformation}
- Differentiation: ${answers.differentiation}

### Content DNA
- Tone: ${answers.desired_tone}
- Brand words: ${answers.brand_words?.filter(Boolean).join(', ') || 'Not specified'}
- Inspiration accounts: ${answers.inspiration_accounts?.filter(Boolean).join(', ') || 'Not specified'}
- Preferred formats: ${answers.preferred_format?.join(', ') || 'Not specified'}
- Content pillars:
${contentPillarsText}

### Personal Story
- Origin story: ${answers.personal_story}
- Credentials: ${answers.legitimating_experience}

## YOUR TASK

Create a comprehensive strategic profile. Some fields are synthesized (combining multiple answers), others are cleaned-up versions of what the user wrote.

Return ONLY valid JSON with this exact structure:
{
  "persona": "A 2-3 sentence description of this creator's brand personality, voice, and communication style. Include their tone, values, and how they come across to their audience.",
  "niche": "A concise niche definition, max 80 characters.",
  "positioning": "A 2-3 sentence positioning statement capturing their unique angle, the problem they solve, and why they're different.",
  "offering": "A 1-2 sentence summary of their core product/service and format.",
  "competitors": ["@handle1", "@handle2", "@handle3"],
  "hot_news": "2-3 current trends or conversations relevant to their niche for content creation.",
  "target_audience": "A clear, concise description of their ideal client — demographics, psychographics, situation. 2-3 sentences.",
  "transformation": "The specific before→after transformation they promise their clients. 1-2 sentences.",
  "tone": "Their desired communication tone, refined. A short phrase.",
  "brand_words": ["word1", "word2", "word3"],
  "preferred_formats": ["format1", "format2"],
  "offer_types": ["type1", "type2"],
  "content_pillars": [
    { "title": "Pillar title", "description": "One sentence describing what this pillar covers." }
  ]
}

IMPORTANT:
- For "competitors", extract Instagram handles from inspiration_accounts. If none provided, suggest 3 relevant accounts in their niche.
- For "hot_news", infer trending topics based on their niche tags and current industry trends.
- For "content_pillars", if the user provided pillars use and refine them. If they left it empty, synthesize 3-5 pillars from their niche, positioning, and offer.
- Clean up and refine the user's raw answers but preserve their voice and intent.
- Write in English regardless of the input language.
- Return ONLY the JSON object, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as StrategicProfile;

  // Ensure arrays are always arrays
  if (!Array.isArray(parsed.competitors)) parsed.competitors = [];
  if (!Array.isArray(parsed.brand_words)) parsed.brand_words = [];
  if (!Array.isArray(parsed.preferred_formats)) parsed.preferred_formats = [];
  if (!Array.isArray(parsed.offer_types)) parsed.offer_types = [];
  if (!Array.isArray(parsed.content_pillars)) parsed.content_pillars = [];

  return parsed;
}
