import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestionCard from "@/components/QuestionCard";
import FloatingBubbles from "@/components/FloatingBubbles";
import { THEMES, FEATURED_QUESTIONS, type QuestionEntry } from "@/lib/constants";
import { BROWSE_THEMES, BROWSE_QUESTIONS } from "@/lib/browse-questions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dbQuestions, setDbQuestions] = useState<QuestionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [themeFilter, setThemeFilter] = useState(searchParams.get("theme") || "");
  const [ageFilter, setAgeFilter] = useState(searchParams.get("age") || "");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"themes" | "library">(
    searchParams.get("theme") || searchParams.get("age") ? "library" : "themes"
  );

  // Fetch public questions via public_questions table for deduplicated browse
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch canonical public questions
        const { data: pubQs, error: pubErr } = await supabase
          .from("public_questions" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (cancelled) return;

        if (!pubErr && pubQs && pubQs.length > 0) {
          // Get the featured story IDs to fetch full question data
          const storyIds = (pubQs as any[])
            .map((pq: any) => pq.featured_story_id)
            .filter(Boolean);

          if (storyIds.length > 0) {
            let query = supabase
              .from("questions")
              .select("*")
              .in("id", storyIds);

            if (ageFilter) query = query.eq("age_group", ageFilter);
            if (sort === "newest") query = query.order("created_at", { ascending: false });

            if (themeFilter) {
              const { data: themeRows } = await supabase
                .from("themes")
                .select("id")
                .eq("slug", themeFilter)
                .maybeSingle();

              if (themeRows) {
                const { data: qtRows } = await supabase
                  .from("question_themes")
                  .select("question_id")
                  .eq("theme_id", themeRows.id);

                if (qtRows && qtRows.length > 0) {
                  query = query.in("id", qtRows.map(r => r.question_id));
                } else {
                  if (!cancelled) { setDbQuestions([]); setLoading(false); }
                  return;
                }
              }
            }

            const { data, error } = await query.limit(50);
            if (cancelled) return;

            if (!error && data && data.length > 0) {
              // Attach public_count to each question
              const countMap = new Map((pubQs as any[]).map((pq: any) => [pq.featured_story_id, pq.public_count]));
              const enriched = data.map((q: any) => ({
                ...q,
                public_count: countMap.get(q.id) || 1,
              }));
              setDbQuestions(enriched as unknown as QuestionEntry[]);
            } else {
              setDbQuestions(FEATURED_QUESTIONS);
            }
          } else {
            setDbQuestions(FEATURED_QUESTIONS);
          }
        } else {
          // Fallback to direct questions query
          let query = supabase
            .from("questions")
            .select("*")
            .eq("is_public", true);

          if (ageFilter) query = query.eq("age_group", ageFilter);
          if (sort === "newest") query = query.order("created_at", { ascending: false });

          const { data, error } = await query.limit(50);
          if (cancelled) return;
          if (!error && data && data.length > 0) {
            setDbQuestions(data as unknown as QuestionEntry[]);
          } else {
            setDbQuestions(FEATURED_QUESTIONS);
          }
        }
      } catch {
        if (!cancelled) setDbQuestions(FEATURED_QUESTIONS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (view === "library") fetchData();
    return () => { cancelled = true; };
  }, [themeFilter, ageFilter, sort, view]);

  const filteredDbQuestions = search.trim()
    ? dbQuestions.filter(r => {
        const q = search.toLowerCase();
        return (
          r.question_text.toLowerCase().includes(q) ||
          r.metaphor_title.toLowerCase().includes(q) ||
          r.child_name.toLowerCase().includes(q)
        );
      })
    : dbQuestions;

  // Filter hardcoded browse questions by search
  const filteredBrowse = search.trim()
    ? BROWSE_QUESTIONS.filter(q =>
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.metaphor.toLowerCase().includes(search.toLowerCase())
      )
    : BROWSE_QUESTIONS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

          {/* Search */}
          <div className="bg-card rounded-2xl p-6 storybook-shadow mb-6">
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
          </div>

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-10">
            {BROWSE_THEMES.map(t => (
              <button
                key={t.slug}
                onClick={() => {
                  setView("themes");
                  setSearch("");
                  // Scroll to theme section
                  setTimeout(() => {
                    document.getElementById(`theme-${t.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display font-semibold transition-all bg-card hover:bg-primary/20 border border-border"
              >
                <img src={t.image} alt="" className="w-5 h-5 object-contain" style={{ mixBlendMode: "multiply" }} />
                {t.name}
              </button>
            ))}
          </div>

          {/* Themed Accordion Sections */}
          {view === "themes" && (
            <div className="space-y-10 mb-16">
              {BROWSE_THEMES.map(theme => {
                const themeQs = filteredBrowse.filter(q => q.theme === theme.slug);
                if (themeQs.length === 0) return null;
                return (
                  <div key={theme.slug} id={`theme-${theme.slug}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={theme.image}
                        alt=""
                        className="w-12 h-12 object-contain"
                        style={{ mixBlendMode: "multiply" }}
                      />
                      <h2 className="font-display text-xl font-bold">{theme.name}</h2>
                    </div>
                    <div className="bg-card rounded-2xl storybook-shadow overflow-hidden">
                      <Accordion type="single" collapsible className="w-full">
                        {themeQs.map(q => (
                          <AccordionItem key={q.id} value={q.id} className="border-border px-6">
                            <AccordionTrigger className="text-left font-display font-semibold text-sm md:text-base py-5 hover:no-underline">
                              {q.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                                {q.metaphor}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Library View (DB questions) */}
          {view === "library" && (
            <>
              <div className="bg-card rounded-2xl p-6 storybook-shadow mb-10">
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

              {filteredDbQuestions.length === 0 ? (
                <div className="text-center py-16">
                  <img src="/metaphor-images/leaf_watercolor-2.png" alt="" className="w-28 h-28 mx-auto mb-4" />
                  <p className="font-display text-muted-foreground">No questions found. Try a different search.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDbQuestions.map(q => (
                    <QuestionCard key={q.id} question={q} isSquare />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Toggle to library */}
          {view === "themes" && (
            <div className="text-center mt-8">
              <button
                onClick={() => setView("library")}
                className="font-display text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                View community stories
              </button>
            </div>
          )}
          {view === "library" && (
            <div className="text-center mt-8">
              <button
                onClick={() => setView("themes")}
                className="font-display text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                Browse by theme
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BrowsePage;
