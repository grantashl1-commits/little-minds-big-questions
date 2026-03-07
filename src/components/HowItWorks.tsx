import starsDivider from "@/assets/section-stars-divider.png";

const steps = [
  {
    image: "/metaphor-images/crayons.png",
    title: "A child asks a question",
    description: "Children often ask difficult questions about life, death, feelings, or the world.",
  },
  {
    image: "/metaphor-images/rocket.png",
    title: "We turn it into a story",
    description: "Our AI creates a gentle metaphor-based answer suited to their age.",
  },
  {
    image: "/metaphor-images/planet.png",
    title: "Share and explore",
    description: "Responses can be saved and searched so other families can use them too.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-6 bg-card/50 relative">
      <div className="container max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-4">
                <img src={step.image} alt={step.title} className="w-36 h-36 object-contain drop-shadow-sm" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Stars divider — softened and floating */}
      <div className="absolute -bottom-6 left-0 right-0 pointer-events-none flex justify-center">
        <img
          src={starsDivider}
          alt=""
          className="w-2/3 md:w-1/2 h-auto object-contain opacity-30 mix-blend-multiply"
        />
      </div>
    </section>
  );
};

export default HowItWorks;
