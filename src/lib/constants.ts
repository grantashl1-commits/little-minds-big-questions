export const THEMES = [
  { name: "Death & Dying", slug: "death-dying", image: "/metaphor-images/butterfly.png" },
  { name: "Grief & Loss", slug: "grief-loss", image: "/metaphor-images/elephant.png" },
  { name: "Feelings", slug: "feelings", image: "/metaphor-images/volcano.png" },
  { name: "Friendship", slug: "friendship", image: "/metaphor-images/penguin.png" },
  { name: "Identity", slug: "identity", image: "/metaphor-images/deer.png" },
  { name: "Family Changes", slug: "family-change", image: "/metaphor-images/sandcastle.png" },
  { name: "School & Confidence", slug: "school-confidence", image: "/metaphor-images/kite-watercolor.png" },
  { name: "Kindness", slug: "kindness", image: "/metaphor-images/hot-air-balloon.png" },
  { name: "Bodies & Differences", slug: "bodies", image: "/metaphor-images/snowflake.png" },
  { name: "Spirituality", slug: "spirituality", image: "/metaphor-images/lightning.png" },
  { name: "Worry & Anxiety", slug: "worry-anxiety", image: "/metaphor-images/wave.png" },
  { name: "Babies & Birth", slug: "babies-birth", image: "/metaphor-images/seedling.png" },
] as const;

export type ThemeSlug = typeof THEMES[number]["slug"];

export function getAgeGroup(age: number): string {
  if (age <= 3) return "2–3";
  if (age <= 5) return "4–5";
  if (age <= 7) return "6–7";
  return "8–10";
}

export interface QuestionEntry {
  id: string;
  child_name: string;
  child_age: number;
  age_group: string;
  question_text: string;
  context?: string;
  parent_note?: string;
  metaphor_title: string;
  metaphor_answer: string;
  parent_explanation: string;
  image_prompt?: string;
  image_url?: string;
  is_public: boolean;
  created_at: string;
  themes?: string[];
  audio_url?: string;
  transcription?: string;
  audio_uploaded?: boolean;
}

export const FEATURED_QUESTIONS: QuestionEntry[] = [
  {
    id: "1",
    child_name: "Ruby",
    child_age: 5,
    age_group: "4–5",
    question_text: "What happens when we die?",
    metaphor_title: "The Butterfly and the Garden",
    metaphor_answer: "Sometimes life is like a garden. When a flower finishes blooming, its petals fall gently back to the earth. But the love, seeds, and beauty it created stay in the garden forever.",
    parent_explanation: "Young children understand change better through nature imagery. You can explain that death is when a body stops working, but the love someone shared continues through memories.",
    image_url: "/metaphor-images/hot-air-balloon.png",
    is_public: true,
    created_at: new Date().toISOString(),
    themes: ["death-dying", "grief-loss"],
  },
  {
    id: "2",
    child_name: "Leo",
    child_age: 4,
    age_group: "4–5",
    question_text: "Why did Grandma go away?",
    metaphor_title: "The Star That Moved",
    metaphor_answer: "Imagine if every person who loved you became a star in the sky. Grandma became a very bright star. She's not gone — she's just shining from a different place now.",
    parent_explanation: "At this age, children may not understand permanence. Use imagery of continued presence in a different form rather than 'gone forever'.",
    image_url: "/metaphor-images/planet.png",
    is_public: true,
    created_at: new Date().toISOString(),
    themes: ["grief-loss", "feelings"],
  },
  {
    id: "3",
    child_name: "Mia",
    child_age: 6,
    age_group: "6–7",
    question_text: "Why can't I be friends with everyone?",
    metaphor_title: "The Ocean and the Shells",
    metaphor_answer: "The ocean has millions of shells on the beach. Some shells fit perfectly in your hand, and some don't. It doesn't mean those shells aren't beautiful — they just belong in someone else's collection.",
    parent_explanation: "Help children understand that not all relationships click, and that's natural. Focus on the quality of friendships rather than quantity.",
    image_url: "/metaphor-images/turtle.png",
    is_public: true,
    created_at: new Date().toISOString(),
    themes: ["friendship", "feelings"],
  },
];
