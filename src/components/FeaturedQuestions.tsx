import { FEATURED_QUESTIONS } from "@/lib/constants";
import QuestionCard from "@/components/QuestionCard";
import instagramIcon from "@/assets/instagram-icon.png";

const FeaturedQuestions = () => {
  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Featured Questions</h2>
        <p className="text-muted-foreground text-center mb-10">See how we turn tough questions into gentle stories</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_QUESTIONS.map(q => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href="https://www.instagram.com/littlemindsbigquestions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <img src={instagramIcon} alt="Instagram" className="w-5 h-5 rounded" />
            Join the conversation on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedQuestions;
