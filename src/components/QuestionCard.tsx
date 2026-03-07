import { Link } from "react-router-dom";
import { THEMES, type QuestionEntry } from "@/lib/constants";

const THEME_COLORS: Record<string, string> = {
  "death-dying": "bg-secondary/30 text-secondary-foreground",
  "grief-loss": "bg-primary/30 text-primary-foreground",
  "feelings": "bg-accent/30 text-accent-foreground",
  "friendship": "bg-sage/30 text-sage-foreground",
  "identity": "bg-peach/30 text-peach-foreground",
  "family-change": "bg-secondary/30 text-secondary-foreground",
  "school-confidence": "bg-primary/30 text-primary-foreground",
  "kindness": "bg-sage/30 text-sage-foreground",
  "bodies": "bg-accent/30 text-accent-foreground",
  "spirituality": "bg-peach/30 text-peach-foreground",
  "worry-anxiety": "bg-secondary/30 text-secondary-foreground",
  "babies-birth": "bg-primary/30 text-primary-foreground",
};

interface QuestionCardProps {
  question: QuestionEntry;
  isSquare?: boolean;
}

const QuestionCard = ({ question, isSquare = false }: QuestionCardProps) => {
  const themeData = question.themes?.map(slug => {
    const t = THEMES.find(th => th.slug === slug);
    return { name: t ? t.name : slug, slug };
  }) || [];

  return (
    <Link
      to={`/result/${question.id}`}
      className={`block bg-card rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] storybook-shadow ${
        isSquare ? "aspect-square" : ""
      }`}
    >
      {question.image_url && (
        <div className="flex justify-center pt-4">
          <img
            src={question.image_url}
            alt={question.metaphor_title}
            className="w-32 h-32 object-contain drop-shadow-sm"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
      )}
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
          {themeData.slice(0, 3).map(tag => (
            <span
              key={tag.slug}
              className={`text-xs font-display rounded-full px-3 py-1 ${THEME_COLORS[tag.slug] || "bg-primary/20"}`}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
