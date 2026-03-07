import { FEATURED_QUESTIONS } from "@/lib/constants";
import QuestionCard from "@/components/QuestionCard";

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
      </div>
    </section>
  );
};

export default FeaturedQuestions;
