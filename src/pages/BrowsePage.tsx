import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestionCard from "@/components/QuestionCard";
import FloatingBubbles from "@/components/FloatingBubbles";
import { THEMES, FEATURED_QUESTIONS, type QuestionEntry } from "@/lib/constants";

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [themeFilter, setThemeFilter] = useState(searchParams.get("theme") || "");
  const [ageFilter, setAgeFilter] = useState(searchParams.get("age") || "");
  const [sort, setSort] = useState("newest");
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("questions")
          .select("*")
          .eq("is_public", true);

        if (ageFilter) {
          query = query.eq("age_group", ageFilter);
        }

        if (sort === "newest") {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query.limit(50);
        
        let results: QuestionEntry[] = [];
        
        if (error || !data || data.length === 0) {
          results = FEATURED_QUESTIONS;
        } else {
          results = data as unknown as QuestionEntry[];
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          results = results.filter(
            r => r.question_text.toLowerCase().includes(q) ||
                 r.metaphor_title.toLowerCase().includes(q) ||
                 r.child_name.toLowerCase().includes(q)
          );
        }

        setQuestions(results);
      } catch {
        setQuestions(FEATURED_QUESTIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [themeFilter, ageFilter, sort, searchTrigger]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="py-16 px-6 relative">
        <FloatingBubbles count={4} />
        <div className="container max-w-5xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">Explore Questions</h1>
          <p className="text-muted-foreground text-center mb-10">
            Discover gentle answers to life's big questions
          </p>

          {/* Search & Filters */}
          <div className="bg-card rounded-2xl p-6 storybook-shadow mb-10">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-display font-semibold text-sm hover:bg-primary/80 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <select
                value={themeFilter}
                onChange={e => {
                  setThemeFilter(e.target.value);
                  setSearchParams(prev => {
                    if (e.target.value) prev.set("theme", e.target.value);
                    else prev.delete("theme");
                    return prev;
                  });
                }}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Themes</option>
                {THEMES.map(t => (
                  <option key={t.slug} value={t.slug}>{t.name}</option>
                ))}
              </select>

              <select
                value={ageFilter}
                onChange={e => setAgeFilter(e.target.value)}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Ages</option>
                <option value="2–3">2–3</option>
                <option value="4–5">4–5</option>
                <option value="6–7">6–7</option>
                <option value="8–10">8–10</option>
              </select>

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-16">
              <img src="/metaphor-images/owl.png" alt="" className="w-28 h-28 mx-auto mb-4 animate-float" />
              <p className="font-display text-muted-foreground">Searching...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16">
              <img src="/metaphor-images/leaf_watercolor-2.png" alt="" className="w-28 h-28 mx-auto mb-4" />
              <p className="font-display text-muted-foreground">No questions found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {questions.map(q => (
                <QuestionCard key={q.id} question={q} isSquare />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BrowsePage;
