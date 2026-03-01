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
  // Editorial Positioning (fully AI-generated)
  verbal_territory: {
    tone: string;                   // polished tone-of-voice phrase
    style: string;                  // communication style sentence
    preferred_vocabulary: string[]; // 4–6 words/phrases to use
    words_to_avoid: string[];       // 3–5 terms that clash with positioning
  };
  post_objectives: string[]; // subset of: Visibility | Connection | Conversion | Education & Authority
}

export async function processOnboardingAnswers(answers: OnboardingAnswers): Promise<StrategicProfile> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-pro-preview',
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 8192,
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
- Primary Industry: ${answers.primary_industry || 'Not specified'}

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
- Voice keywords: ${answers.voice_keywords?.join(', ') || 'Not specified'}
- Inspiration accounts: ${answers.inspiration_accounts?.filter(Boolean).join(', ') || 'Not specified'}
- Preferred formats: ${answers.preferred_format?.join(', ') || 'Not specified'}
- Content pillars:
${contentPillarsText}

### Personal Story
- Origin story: ${answers.personal_story}
- Credentials: ${answers.legitimating_experience}

### Brand Voice
- Bio: ${answers.brand_bio || 'Not specified'}

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
  ],
  "verbal_territory": {
    "tone": "Polished tone-of-voice phrase synthesizing their raw answers, e.g. 'Expert, warm, occasionally provocative'",
    "style": "Communication style sentence, e.g. 'Story-driven, science-backed and conversational — bridges clinical expertise with lived experience'",
    "preferred_vocabulary": ["authentic", "evidence-based", "transform", "reclaim", "nourish"],
    "words_to_avoid": ["detox", "quick fix", "guru", "hack"]
  },
  "post_objectives": ["Visibility", "Connection", "Education & Authority"]
}

IMPORTANT:
- For "competitors", extract Instagram handles from inspiration_accounts. If none provided, suggest 3 relevant accounts in their niche.
- For "hot_news", infer trending topics based on their niche tags and current industry trends.
- For "content_pillars", synthesize 3–5 HIGHLY SPECIFIC, tailored pillars from all answers. Be original and precise — e.g. "Hormonal Nutrition for Expats", "Gut Reset Protocols", "Nervous System Recovery". Do NOT use generic titles like "Wellness Tips", "Healthy Lifestyle", or "Mindset". If the user provided pillars, refine them to be more specific.
- For "verbal_territory.tone": Synthesize the user's desired_tone, brand_words, and voice_keywords into one polished phrase.
- For "verbal_territory.style": Derive from their content formats, persona, tone and origin story — 1 sentence.
- For "preferred_vocabulary": 4–6 specific words or short phrases that reinforce their brand voice and resonate with their audience.
- For "words_to_avoid": 3–5 terms that would undermine their positioning, feel off-brand, or overused in their niche.
- For "post_objectives": Select 2–4 from [Visibility, Connection, Conversion, Education & Authority] based on their offer type, audience relationship, and content formats.
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

  // Ensure verbal_territory is always a valid object
  if (!parsed.verbal_territory || typeof parsed.verbal_territory !== 'object') {
    parsed.verbal_territory = { tone: '', style: '', preferred_vocabulary: [], words_to_avoid: [] };
  }
  if (!Array.isArray(parsed.verbal_territory.preferred_vocabulary)) parsed.verbal_territory.preferred_vocabulary = [];
  if (!Array.isArray(parsed.verbal_territory.words_to_avoid)) parsed.verbal_territory.words_to_avoid = [];

  // Ensure post_objectives is always an array
  if (!Array.isArray(parsed.post_objectives)) parsed.post_objectives = [];

  return parsed;
}
