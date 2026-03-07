import { Link } from "react-router-dom";
import { THEMES } from "@/lib/constants";

const themeColors = [
  "bg-primary/40", "bg-secondary/40", "bg-accent/40", "bg-sage/40",
  "bg-peach/40", "bg-primary/30", "bg-secondary/30", "bg-accent/30",
  "bg-sage/30", "bg-peach/30", "bg-primary/40", "bg-secondary/40",
];

const ThemeGrid = () => {
  return (
    <section className="py-16 px-6">
      <div className="container max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Browse by Theme</h2>
        <p className="text-muted-foreground text-center mb-10">Find answers to questions about life's big topics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {THEMES.map((theme, i) => (
            <Link
              key={theme.slug}
              to={`/browse?theme=${theme.slug}`}
              className={`${themeColors[i]} rounded-2xl p-5 text-center transition-all duration-200 hover:scale-[1.03] tile-shadow`}
            >
              <div className="flex justify-center mb-2">
                <img
                  src={theme.image}
                  alt={theme.name}
                  className="w-28 h-28 object-contain"
                />
              </div>
              <span className="font-display font-semibold text-sm">{theme.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeGrid;
