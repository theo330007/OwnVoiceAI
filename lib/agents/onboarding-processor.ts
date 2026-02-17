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
  core_belief: string;
  opposition: string;
  tone: string;
  brand_words: string[];
  content_boundaries: string;
  preferred_formats: string[];
  vision_statement: string;
  offer_types: string[];
  offer_price: string;
}

export async function processOnboardingAnswers(answers: OnboardingAnswers): Promise<StrategicProfile> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const prompt = `You are a strategic brand positioning expert for wellness and coaching entrepreneurs.

Analyze the following questionnaire answers and synthesize them into a comprehensive strategic brand profile.

## QUESTIONNAIRE ANSWERS

### Identity & Context
- Name: ${answers.first_name} ${answers.last_name}
- Business: ${answers.business_name}
- Website: ${answers.website}
- Social: Instagram ${answers.instagram}, TikTok ${answers.tiktok}
- Location: ${answers.country}
- Target Market: ${answers.target_market}
- Years in business: ${answers.years_in_business}
- Status: ${answers.employment_status}

### Offer & Business Model
- Offer types: ${answers.offer_type?.join(', ') || 'Not specified'}
- Main offer: ${answers.offer_description}
- Price point: ${answers.average_price}

### Strategic Positioning
- Problem solved: ${answers.problem_solved}
- Target audience: ${answers.target_audience}
- Transformation promised: ${answers.transformation}
- Differentiation: ${answers.differentiation}
- Core belief: ${answers.core_belief}
- Against: ${answers.opposition}

### Content DNA
- Tone: ${answers.desired_tone}
- Brand words: ${answers.brand_words?.filter(Boolean).join(', ') || 'Not specified'}
- Inspiration accounts: ${answers.inspiration_accounts?.filter(Boolean).join(', ') || 'Not specified'}
- Content boundaries: ${answers.content_boundaries}
- Preferred formats: ${answers.preferred_format?.join(', ') || 'Not specified'}

### Personal Story
- Origin story: ${answers.personal_story}
- Credentials: ${answers.legitimating_experience}
- Vision: ${answers.vision_statement}

## YOUR TASK

Create a comprehensive strategic profile. Some fields are synthesized (combining multiple answers), others are cleaned-up versions of what the user wrote.

Return ONLY valid JSON with this exact structure:
{
  "persona": "A 2-3 sentence description of this creator's brand personality, voice, and communication style. Include their tone, values, and how they come across to their audience.",
  "niche": "A concise niche definition, max 80 characters.",
  "positioning": "A 2-3 sentence positioning statement capturing their unique angle, the problem they solve, and why they're different.",
  "offering": "A 1-2 sentence summary of their core product/service, including format and price point.",
  "competitors": ["@handle1", "@handle2", "@handle3"],
  "hot_news": "2-3 current trends or conversations relevant to their niche for content creation.",
  "target_audience": "A clear, concise description of their ideal client — demographics, psychographics, situation. 2-3 sentences.",
  "transformation": "The specific before→after transformation they promise their clients. 1-2 sentences.",
  "core_belief": "Their strongest conviction that drives their work. 1 sentence.",
  "opposition": "What they stand against — practices, mindsets, or industry norms they oppose. 1-2 sentences.",
  "tone": "Their desired communication tone, refined. A short phrase.",
  "brand_words": ["word1", "word2", "word3"],
  "content_boundaries": "What they refuse to do in their content. 1-2 sentences.",
  "preferred_formats": ["format1", "format2"],
  "vision_statement": "Their mission statement, refined into one powerful sentence.",
  "offer_types": ["type1", "type2"],
  "offer_price": "Their price point as stated."
}

IMPORTANT:
- For "competitors", extract Instagram handles from inspiration_accounts. If none provided, suggest 3 relevant accounts in their niche.
- For "hot_news", infer trending topics based on their niche and current industry trends.
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

  return parsed;
}
