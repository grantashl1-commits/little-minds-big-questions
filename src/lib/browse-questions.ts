/** 30 pre-written questions organised by 6 themes, with gentle metaphor answers */

export interface BrowseQuestion {
  id: string;
  theme: string;
  themeName: string;
  question: string;
  metaphor: string;
}

export const BROWSE_THEMES = [
  { slug: "death-loss", name: "Death & Loss", image: "/metaphor-images/butterfly.png" },
  { slug: "god-meaning", name: "God & Meaning", image: "/metaphor-images/lightning.png" },
  { slug: "fairness", name: "Fairness", image: "/metaphor-images/hot-air-balloon.png" },
  { slug: "love", name: "Love", image: "/metaphor-images/elephant.png" },
  { slug: "identity", name: "Identity", image: "/metaphor-images/deer.png" },
  { slug: "time", name: "Time", image: "/metaphor-images/snowflake.png" },
] as const;

export const BROWSE_QUESTIONS: BrowseQuestion[] = [
  // ── Death & Loss ──────────────────────────────────────────
  {
    id: "b-dl-1",
    theme: "death-loss",
    themeName: "Death & Loss",
    question: "Where do people go when they die?",
    metaphor:
      "Imagine a river that flows through a beautiful meadow. Every drop of water eventually reaches the ocean — a place so big and quiet and peaceful that we can't quite see it from the meadow. When someone dies, it's a little like that. Their body stops, like the river reaching the shore, but all the love they gave stays behind in the flowers and the grass and the sunshine they helped grow.",
  },
  {
    id: "b-dl-2",
    theme: "death-loss",
    themeName: "Death & Loss",
    question: "Will you die?",
    metaphor:
      "One day, a very long time from now, everybody's body does stop working — even mine. But think of it like a candle. Even after the flame goes out, the warmth it gave stays in the room. I'll be here for a very, very long time, and the love between us will never go out.",
  },
  {
    id: "b-dl-3",
    theme: "death-loss",
    themeName: "Death & Loss",
    question: "Why do people have to die?",
    metaphor:
      "In a garden, flowers bloom and eventually their petals fall so that new seeds can grow. If flowers never faded, there wouldn't be room for new ones. Life works the same way — every person has their season, and while their petals fall, the seeds of their kindness keep growing in everyone they touched.",
  },
  {
    id: "b-dl-4",
    theme: "death-loss",
    themeName: "Death & Loss",
    question: "What happens to our pet now?",
    metaphor:
      "Your pet's body was like a cosy little house. When the house gets too old, the pet doesn't need it anymore. But every tail-wag, every purr, every cuddle — those live inside your heart like a warm pocket you can reach into whenever you miss them.",
  },
  {
    id: "b-dl-5",
    theme: "death-loss",
    themeName: "Death & Loss",
    question: "Will I die?",
    metaphor:
      "You know how a day has morning, afternoon, and night? You're still in the very early morning of your life — the sun has only just come up! There's so much daytime ahead of you, so many adventures to have. And the people who love you will be right here, walking through the day beside you.",
  },

  // ── God & Meaning ────────────────────────────────────────
  {
    id: "b-gm-1",
    theme: "god-meaning",
    themeName: "God & Meaning",
    question: "Is God real?",
    metaphor:
      "Some people feel God the way you feel the wind — you can't see it, but you know it's there because you feel it on your skin. Different families believe different things about where the wind comes from. What matters most is that we treat each other with kindness, no matter what we believe.",
  },
  {
    id: "b-gm-2",
    theme: "god-meaning",
    themeName: "God & Meaning",
    question: "Why are we here?",
    metaphor:
      "Imagine the whole world is a giant jigsaw puzzle. Every person is one special piece. Without your piece, the picture wouldn't be complete. We're here to find where we fit — to learn, to love, and to help make the picture more beautiful.",
  },
  {
    id: "b-gm-3",
    theme: "god-meaning",
    themeName: "God & Meaning",
    question: "What's the point of everything?",
    metaphor:
      "Think of your favourite song. It doesn't last forever, but while it plays, it fills the room with something wonderful. Life is like that song — the point isn't that it ends, the point is how it makes you feel while it's playing.",
  },
  {
    id: "b-gm-4",
    theme: "god-meaning",
    themeName: "God & Meaning",
    question: "Who made the world?",
    metaphor:
      "Some people say a loving creator painted the sky and sculpted the mountains. Others say the world built itself over billions of years, like a sandcastle made by the ocean's waves. Either way, we get to live in something incredibly beautiful — and that's pretty amazing.",
  },
  {
    id: "b-gm-5",
    theme: "god-meaning",
    themeName: "God & Meaning",
    question: "Why does anything exist?",
    metaphor:
      "That's one of the biggest questions anyone has ever asked — even grown-ups wonder about it! It's a bit like asking why music sounds beautiful. Nobody knows for certain, but asking the question is part of what makes us human. And asking big questions means you have a very big, wonderful mind.",
  },

  // ── Fairness ─────────────────────────────────────────────
  {
    id: "b-f-1",
    theme: "fairness",
    themeName: "Fairness",
    question: "Why are some people rich and some poor?",
    metaphor:
      "Imagine everyone starts a board game, but some players get extra turns and others don't. It's not because one player is better — the rules were just set up unevenly. In real life, some people are born with more help than others. What matters is that we share, we care, and we try to make the game fairer for everyone.",
  },
  {
    id: "b-f-2",
    theme: "fairness",
    themeName: "Fairness",
    question: "Why do bad things happen to good people?",
    metaphor:
      "Sometimes rain falls on the prettiest garden. It's not because the garden did something wrong — rain just falls where it falls. Bad things don't happen because someone deserves them. What's beautiful is how the garden keeps growing, even after the storm.",
  },
  {
    id: "b-f-3",
    theme: "fairness",
    themeName: "Fairness",
    question: "Is life fair?",
    metaphor:
      "If you and your friend each planted a seed, one might grow faster even if you watered them the same way. Life isn't always fair in the same way — but that's why kindness matters so much. We can't control the rain, but we can share our umbrella.",
  },
  {
    id: "b-f-4",
    theme: "fairness",
    themeName: "Fairness",
    question: "Why do people get sick?",
    metaphor:
      "Your body is like a castle with tiny guards protecting it. Sometimes a germ sneaks past the guards, and the castle has to fight back. Getting sick isn't anyone's fault — it's just what happens when the guards need a little extra help. And most of the time, the castle wins.",
  },
  {
    id: "b-f-5",
    theme: "fairness",
    themeName: "Fairness",
    question: "Why do some kids have less than us?",
    metaphor:
      "Imagine every family has a backpack. Some backpacks come full of supplies, and some start a bit empty — not because of anything the family did, but because of where and when they started their journey. We can help by sharing what's in ours. Even a small kindness can fill someone's backpack a little more.",
  },

  // ── Love ─────────────────────────────────────────────────
  {
    id: "b-l-1",
    theme: "love",
    themeName: "Love",
    question: "How do you know if someone loves you?",
    metaphor:
      "Love is like sunshine — you can't hold it in your hands, but you can feel its warmth. You know someone loves you when they listen to you, show up for you, and make you feel safe. Love isn't always loud — sometimes it's a quiet cup of warm cocoa made just for you.",
  },
  {
    id: "b-l-2",
    theme: "love",
    themeName: "Love",
    question: "What is love?",
    metaphor:
      "Love is like an invisible thread between people. You can't see it, but it connects hearts even when people are far apart. Love is choosing to be kind even when it's hard, and feeling happy just because someone else is happy.",
  },
  {
    id: "b-l-3",
    theme: "love",
    themeName: "Love",
    question: "Will you love me forever?",
    metaphor:
      "My love for you is like the sky — it doesn't have an edge. Even on cloudy days when you can't see the blue, it's still there, stretching out in every direction. There is nothing you could ever do that would make the sky disappear. My love for you is that big.",
  },
  {
    id: "b-l-4",
    theme: "love",
    themeName: "Love",
    question: "Why do people fall out of love?",
    metaphor:
      "Sometimes two trees grow so close together that their branches get tangled up. It doesn't mean they're bad trees — they just need more space to grow. When grown-ups fall out of love, it's a bit like that. They still care, but they grow better in different parts of the forest.",
  },
  {
    id: "b-l-5",
    theme: "love",
    themeName: "Love",
    question: "Can love hurt?",
    metaphor:
      "Love can feel like holding a beautiful seashell. If you squeeze it too tightly, it might pinch. And if you lose it, you feel sad because it meant so much to you. The hurt comes because the love was real and precious. But even when love hurts, it's still one of the best things we have.",
  },

  // ── Identity ─────────────────────────────────────────────
  {
    id: "b-i-1",
    theme: "identity",
    themeName: "Identity",
    question: "Why am I me?",
    metaphor:
      "Of all the billions of snowflakes that have ever fallen, not a single one has been exactly the same. You're like that — a one-of-a-kind design made from your own special mix of thoughts, feelings, and dreams. Nobody else in the whole universe can be you.",
  },
  {
    id: "b-i-2",
    theme: "identity",
    themeName: "Identity",
    question: "What makes me, me?",
    metaphor:
      "Imagine you're a recipe. You've got a pinch of your mum's laugh, a dash of your dad's curiosity, your own favourite colour, your own fears and bravery. Mix it all together and you get something nobody has ever tasted before — you!",
  },
  {
    id: "b-i-3",
    theme: "identity",
    themeName: "Identity",
    question: "Do I have a soul?",
    metaphor:
      "You know how a lamp has a light inside it? Some people believe we each have a little light inside us too — a gentle glow that makes us who we are. Whether you call it a soul, a spirit, or just 'you,' it's the part that feels wonder when you look at the stars.",
  },
  {
    id: "b-i-4",
    theme: "identity",
    themeName: "Identity",
    question: "Why do I look different?",
    metaphor:
      "Think of a box of crayons. If every crayon were the same colour, you could only draw one kind of picture. But because each crayon is different, you can make the most beautiful, colourful drawings. People are like crayons — different shades making the world more beautiful together.",
  },
  {
    id: "b-i-5",
    theme: "identity",
    themeName: "Identity",
    question: "Am I special?",
    metaphor:
      "There are billions of stars in the sky, and each one shines in its own way. Some are big and bright, some are small and twinkly, but every single one matters to the night sky. You are one of those stars — and the people who love you can always find your light.",
  },

  // ── Time ─────────────────────────────────────────────────
  {
    id: "b-t-1",
    theme: "time",
    themeName: "Time",
    question: "Did time exist before I was born?",
    metaphor:
      "Imagine a river that has been flowing since before anyone can remember. You jumped into the river the day you were born, and now you're part of its story. The river was flowing before you, and it'll keep flowing — but your splash made it more beautiful.",
  },
  {
    id: "b-t-2",
    theme: "time",
    themeName: "Time",
    question: "Does time ever end?",
    metaphor:
      "That's a question that even the cleverest scientists wonder about! Time is a bit like a path that stretches so far that nobody can see where it goes. Maybe it loops around, maybe it keeps going. The wonderful thing is that right now, we're on the path together.",
  },
  {
    id: "b-t-3",
    theme: "time",
    themeName: "Time",
    question: "Why does time go fast when I'm happy?",
    metaphor:
      "When you're doing something you love, your heart is so full that it forgets to watch the clock. It's like sliding down the best slide at the playground — you're having so much fun that whoooosh, you're at the bottom before you know it! Happy moments feel fast because your heart is busy being joyful.",
  },
  {
    id: "b-t-4",
    theme: "time",
    themeName: "Time",
    question: "What is a memory?",
    metaphor:
      "A memory is like a photograph your brain takes all by itself. When something makes you laugh, or feel loved, or even a little scared, your brain says 'I want to keep this!' and tucks it into a special album. Some photos are bright and clear, and some get a little fuzzy — but they're all yours.",
  },
  {
    id: "b-t-5",
    theme: "time",
    themeName: "Time",
    question: "What was there before the universe?",
    metaphor:
      "That question is like standing at the edge of a map where the drawing stops and there's just empty paper. Nobody really knows what's beyond the edge — and that's actually exciting! It means there's still a mystery big enough for every scientist, dreamer, and curious kid like you to explore.",
  },
];
