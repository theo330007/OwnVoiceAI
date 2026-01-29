-- Sample Trends Data for OwnVoiceAI
-- Run this in your Supabase SQL Editor after running the initial migration

-- Macro Trends
INSERT INTO trends (layer, trend_type, title, description, source_url, keywords, relevance_score) VALUES
('macro', 'wellness', 'Gut-Brain Connection Awareness', 'Growing understanding of the microbiome''s impact on mental health and cognitive function. More people are exploring the gut-brain axis for holistic wellness.', 'https://example.com/gut-brain', ARRAY['gut health', 'mental health', 'microbiome', 'brain health'], 90),
('macro', 'wellness', 'Personalized Nutrition Revolution', 'Shift from one-size-fits-all diets to personalized nutrition based on genetics, microbiome, and biomarkers.', 'https://example.com/personalized-nutrition', ARRAY['nutrition', 'personalized health', 'biomarkers'], 85),
('macro', 'wellness', 'Stress Management Focus', 'Increased focus on stress as a root cause of chronic illness. More people seeking evidence-based stress reduction techniques.', 'https://example.com/stress', ARRAY['stress', 'cortisol', 'chronic stress', 'wellness'], 88),
('macro', 'wellness', 'Holistic Hormonal Health', 'Women seeking natural approaches to hormonal balance beyond conventional medicine. Rise of functional medicine for hormones.', 'https://example.com/hormones', ARRAY['hormones', 'women''s health', 'functional medicine'], 92),
('macro', 'wellness', 'Sleep Optimization Movement', 'Recognition of sleep as a pillar of health. Growth in sleep tracking and evidence-based sleep hygiene practices.', 'https://example.com/sleep', ARRAY['sleep', 'circadian rhythm', 'sleep optimization'], 87);

-- Niche Trends
INSERT INTO trends (layer, trend_type, title, description, source_url, keywords, relevance_score) VALUES
('niche', 'fertility', 'Omega-3s for Egg Quality', 'Research showing omega-3 fatty acids improve egg quality and conception rates. Becoming mainstream in fertility communities.', 'https://example.com/omega3-fertility', ARRAY['fertility', 'omega-3', 'egg quality', 'conception'], 85),
('niche', 'adaptogens', 'Ashwagandha for Cortisol', 'Clinical evidence for ashwagandha''s ability to reduce cortisol levels. Popular in stress management protocols.', 'https://example.com/ashwagandha', ARRAY['ashwagandha', 'adaptogens', 'cortisol', 'stress'], 88),
('niche', 'gut-health', 'Polyphenols for Microbiome', 'Growing awareness of polyphenols as prebiotic compounds that support beneficial gut bacteria.', 'https://example.com/polyphenols', ARRAY['polyphenols', 'gut health', 'microbiome', 'prebiotics'], 82),
('niche', 'hormones', 'Seed Cycling Practice', 'Seed cycling (flax, pumpkin, sunflower, sesame) for hormonal balance gaining traction despite limited research.', 'https://example.com/seed-cycling', ARRAY['seed cycling', 'hormones', 'menstrual cycle', 'natural health'], 75),
('niche', 'nutrition', 'Mineral Balance for Energy', 'Focus on mineral deficiencies (magnesium, iron, zinc) as root cause of fatigue. Hair tissue mineral analysis trending.', 'https://example.com/minerals', ARRAY['minerals', 'energy', 'fatigue', 'magnesium'], 80),
('niche', 'stress', 'Vagus Nerve Stimulation', 'Techniques to activate the vagus nerve (breathwork, cold exposure, humming) for stress reduction and nervous system regulation.', 'https://example.com/vagus', ARRAY['vagus nerve', 'nervous system', 'stress', 'breathwork'], 86);

-- Sample Knowledge Base Entries (without embeddings - user will need to add these via the admin panel)
-- These are examples of what to add:

-- Example 1: Omega-3 and Fertility
-- Title: Impact of Omega-3 Fatty Acids on Female Fertility
-- Content: Research has shown that omega-3 fatty acids, particularly EPA and DHA, play crucial roles in reproductive health. A 2024 meta-analysis of 15 randomized controlled trials found that women with higher omega-3 levels had a 23% higher conception rate compared to those with lower levels. The mechanisms include improved egg quality through reduced oxidative stress, better embryo implantation via anti-inflammatory effects, and enhanced hormonal balance. Studies recommend 1000-2000mg daily of combined EPA/DHA for women trying to conceive. The omega-3 index (percentage of omega-3s in red blood cell membranes) should ideally be above 8% for optimal fertility outcomes.
-- Source: Journal of Reproductive Medicine
-- Source URL: https://pubmed.example.com/omega3-fertility
-- Topic Tags: fertility, nutrition, omega-3

-- Example 2: Adaptogenic Herbs
-- Title: Adaptogenic Herbs for Stress Management and Hormonal Balance
-- Content: Adaptogenic herbs such as Ashwagandha, Rhodiola, and Holy Basil have been extensively studied for their effects on the hypothalamic-pituitary-adrenal (HPA) axis. Clinical trials demonstrate that Ashwagandha (600mg daily) can reduce cortisol levels by up to 30% and improve stress resilience scores. Rhodiola has shown benefits for mental fatigue and cognitive performance under stress. These herbs work by modulating stress response pathways rather than suppressing them, supporting the body's natural adaptation mechanisms. Long-term studies show sustained benefits without tolerance development. Best results occur with 8-12 weeks of consistent use.
-- Source: Integrative Medicine Research
-- Source URL: https://pubmed.example.com/adaptogens
-- Topic Tags: stress, adaptogens, hormones, cortisol

-- Example 3: Gut-Brain Axis
-- Title: The Gut-Brain Axis and Mental Health
-- Content: The bidirectional communication between the gut microbiome and the central nervous system has emerged as a critical factor in mental health. Studies show that gut bacteria produce neurotransmitters including 90% of the body's serotonin and 50% of dopamine. Dysbiosis (imbalanced gut flora) is associated with increased rates of anxiety and depression. Probiotic interventions with specific strains (Lactobacillus and Bifidobacterium) have shown modest but significant improvements in mood and anxiety symptoms in randomized controlled trials. The mechanisms involve reduced inflammation, improved vagus nerve signaling, and direct neurotransmitter production.
-- Source: Nature Neuroscience
-- Source URL: https://nature.com/gut-brain-axis
-- Topic Tags: gut health, mental health, microbiome, neuroscience

COMMIT;
