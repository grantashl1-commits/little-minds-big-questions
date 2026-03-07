const steps = [
  {
    emoji: "💬",
    title: "A child asks a question",
    description: "Children often ask difficult questions about life, death, feelings, or the world.",
  },
  {
    emoji: "📖",
    title: "We turn it into a story",
    description: "Our AI creates a gentle metaphor-based answer suited to their age.",
  },
  {
    emoji: "🌟",
    title: "Share and explore",
    description: "Responses can be saved and searched so other families can use them too.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-6 bg-card/50">
      <div className="container max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
