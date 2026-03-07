import { Link } from "react-router-dom";
import { THEMES, type QuestionEntry } from "@/lib/constants";

interface QuestionCardProps {
  question: QuestionEntry;
  isSquare?: boolean;
}

const QuestionCard = ({ question, isSquare = false }: QuestionCardProps) => {
  const themeNames = question.themes?.map(slug => {
    const t = THEMES.find(th => th.slug === slug);
    return t ? t.name : slug;
  }) || [];

  return (
    <Link
      to={`/result/${question.id}`}
      className={`block bg-card rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] storybook-shadow ${
        isSquare ? "aspect-square" : ""
      }`}
    >
      <div className={`p-6 flex flex-col ${isSquare ? "h-full justify-between" : ""}`}>
        <div>
          <p className="text-xs font-display font-semibold text-muted-foreground mb-2">
            {question.child_name}, age {question.child_age}
          </p>
          <h3 className="font-display font-bold text-base mb-3 leading-snug">
            "{question.question_text}"
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {question.metaphor_answer}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {themeNames.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs font-display bg-primary/20 rounded-full px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
