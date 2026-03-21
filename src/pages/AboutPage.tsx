import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBubbles from "@/components/FloatingBubbles";
import { Mail } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 text-center">
        <FloatingBubbles count={10} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in-up">
            About Little Minds BIG Questions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Helping parents answer life's biggest questions through simple stories and metaphors.
          </p>
          {/* Decorative watercolour accents */}
          <img src="/metaphor-images/butterfly.png" alt="" className="absolute top-6 right-4 w-14 opacity-40 pointer-events-none mix-blend-multiply animate-float" style={{ animationDelay: "1s" }} />
          
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 px-6">
        <div className="container max-w-2xl mx-auto">
          <div className="rounded-2xl bg-card border border-border p-8 md:p-12 space-y-6 text-foreground leading-relaxed relative overflow-hidden">
            <img src="/metaphor-images/flower.png" alt="" className="absolute -top-4 -right-6 w-20 opacity-20 pointer-events-none mix-blend-multiply" />

            <p>Little Minds BIG Questions began with a conversation that stayed with me for years.</p>

            <p>A friend once told me that her seven-year-old daughter had asked her a question many parents eventually hear:</p>

            <blockquote className="border-l-4 border-primary pl-5 italic text-muted-foreground">
              "What happens when we die?"
            </blockquote>

            <p>She froze.</p>

            <p>Not because she didn't care, but because she cared so much. She wanted to say the right thing. Something comforting. Something honest. Something that made sense to a child.</p>

            <p>But the right words just didn't come.</p>

            <p>That moment stuck with me.</p>

            <p>Years later, that same friend mentioned another conversation she knew was coming — the one about periods. Her daughter was getting older, and she was worried about how to explain it.</p>

            <blockquote className="border-l-4 border-secondary pl-5 italic text-muted-foreground">
              "If I explain why we have periods," she said, "then I'll have to explain sex too… and I don't even know where to start."
            </blockquote>

            <p>And I realised something.</p>

            <p className="font-semibold">Parents aren't short of love or intention. They're short of words.</p>

            <p>The big questions children ask about life — death, bodies, love, difference, sadness, growing up — often arrive unexpectedly. And when they do, parents are left searching for a way to explain complex ideas in a way children can understand.</p>

            <p>That's where metaphor and storytelling become powerful.</p>

            <p>Children naturally understand stories. They learn through images, imagination, and symbols.</p>

            <div className="space-y-1 pl-4 text-muted-foreground italic">
              <p>A butterfly can explain change.</p>
              <p>A rainbow can explain hope.</p>
              <p>A mountain can explain perseverance.</p>
            </div>

            <p>Little Minds BIG Questions was created to help parents navigate those moments — turning difficult conversations into gentle stories children can understand.</p>
          </div>
        </div>
      </section>

      {/* Divider accent */}
      <div className="flex justify-center py-4">
        <img src="/metaphor-images/rainbow_watercolor-2.png" alt="" className="w-24 opacity-40 mix-blend-multiply" />
      </div>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Our Mission</h2>

          <p className="text-foreground leading-relaxed">Our mission is simple:</p>

          <p className="text-lg font-semibold text-foreground">
            To help parents answer life's biggest questions in a way children can understand.
          </p>

          <p className="text-foreground leading-relaxed">
            Through metaphor, storytelling, and imagination, we transform complex topics into gentle stories that support meaningful conversations between parents and children.
          </p>

          <p className="text-foreground leading-relaxed">
            Every question asked by a child is an opportunity to explore the world together.
          </p>

          <p className="text-muted-foreground italic">
            And sometimes, the biggest questions lead to the most beautiful stories.
          </p>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-16 px-6 relative">
        <FloatingBubbles count={6} />
        <div className="container max-w-2xl mx-auto relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-10">Meet the Founder</h2>

          <div className="rounded-2xl bg-card border border-border p-8 md:p-12 text-center space-y-6">
            <div className="w-36 h-36 rounded-full mx-auto flex items-center justify-center border-4 border-primary/30 overflow-hidden">
              <img
                src="/metaphor-images/owl_watercolor-2.png"
                alt="Founder"
                className="w-full h-full object-contain p-3"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>

            <p className="text-foreground leading-relaxed">
              This project was created by a parent and builder who believes that curiosity is one of the most powerful forces in childhood.
            </p>

            <p className="text-foreground leading-relaxed">
              Little Minds BIG Questions began as a simple idea: <span className="italic">What if there was a place where parents could find gentle, meaningful ways to answer the questions children ask every day?</span>
            </p>

            <p className="text-foreground leading-relaxed">
              Today it is growing into a library of stories designed to help families navigate life's biggest ideas together.
            </p>
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="py-16 px-6">
        <div className="container max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Get in Touch</h2>

          <p className="text-foreground leading-relaxed">
            If you have a question, suggestion, or simply want to share a question your child asked, we'd love to hear from you.
          </p>

          <a
            href="mailto:hello@littlemindsbigquestions.com"
            className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline"
          >
            <Mail className="h-5 w-5" />
            hello@littlemindsbigquestions.com
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
