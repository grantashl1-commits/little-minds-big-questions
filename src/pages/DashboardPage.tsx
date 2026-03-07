import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Library, Star, Loader2, Sparkles, Plus, Trash2,
  Eye, EyeOff, FolderPlus, X, Pencil, Check
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavedQuestion {
  id: string;
  question_id: string;
  collection_id: string | null;
  created_at: string;
  questions: {
    id: string;
    question_text: string;
    metaphor_title: string;
    child_name: string;
    child_age: number;
    is_public: boolean;
    image_url: string | null;
  };
}

interface Collection {
  id: string;
  name: string;
  created_at: string;
}

const DashboardPage = () => {
  const { user, isMember, loading } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"library" | "collections">("library");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchData = useCallback(async () => {
    if (!user || !isMember) {
      setLoadingData(false);
      return;
    }
    const [sqRes, colRes] = await Promise.all([
      supabase
        .from("saved_questions")
        .select("id, question_id, collection_id, created_at, questions(id, question_text, metaphor_title, child_name, child_age, is_public, image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    if (sqRes.data) setSavedQuestions(sqRes.data as unknown as SavedQuestion[]);
    if (colRes.data) setCollections(colRes.data);
    setLoadingData(false);
  }, [user, isMember]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Could not start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const togglePublic = async (sq: SavedQuestion) => {
    const newVal = !sq.questions.is_public;
    const { error } = await supabase
      .from("questions")
      .update({ is_public: newVal })
      .eq("id", sq.question_id);
    if (error) {
      toast.error("Could not update privacy");
    } else {
      toast.success(newVal ? "Story is now public" : "Story is now private");
      fetchData();
    }
  };

  const removeSaved = async (id: string) => {
    const { error } = await supabase.from("saved_questions").delete().eq("id", id);
    if (error) toast.error("Could not remove");
    else {
      toast.success("Removed from library");
      fetchData();
    }
  };

  const moveToCollection = async (sqId: string, collectionId: string | null) => {
    const { error } = await supabase
      .from("saved_questions")
      .update({ collection_id: collectionId })
      .eq("id", sqId);
    if (error) toast.error("Could not move");
    else fetchData();
  };

  const createCollection = async () => {
    if (!newCollectionName.trim() || !user) return;
    const { error } = await supabase
      .from("collections")
      .insert({ user_id: user.id, name: newCollectionName.trim() });
    if (error) toast.error("Could not create collection");
    else {
      toast.success("Collection created");
      setNewCollectionName("");
      setShowNewCollection(false);
      fetchData();
    }
  };

  const renameCollection = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase
      .from("collections")
      .update({ name: editName.trim() })
      .eq("id", id);
    if (error) toast.error("Could not rename");
    else {
      setEditingCollection(null);
      fetchData();
    }
  };

  const deleteCollection = async (id: string) => {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) toast.error("Could not delete collection");
    else {
      toast.success("Collection deleted");
      fetchData();
    }
  };

  const filteredQuestions =
    filterCollection === "all"
      ? savedQuestions
      : filterCollection === "uncategorized"
        ? savedQuestions.filter((sq) => !sq.collection_id)
        : savedQuestions.filter((sq) => sq.collection_id === filterCollection);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome back{user.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""} ✨
        </h1>
        <p className="text-muted-foreground mb-8">
          {isMember
            ? "You're a Founding Member — thank you!"
            : "Upgrade to unlock saving, private stories, and book creation."}
        </p>

        {/* Upgrade CTA for non-members */}
        {!isMember && (
          <Card className="mb-8 border-accent/50 bg-accent/10">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-accent mx-auto mb-3" />
              <p className="font-display text-lg font-semibold mb-1">Founding Member Special — 50% Off</p>
              <p className="text-muted-foreground text-sm mb-4">
                <span className="line-through mr-2">$20 NZD</span>
                <span className="text-foreground font-bold text-lg">$10 NZD</span> one-time
              </p>
              <Button variant="default" size="lg" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirecting…</>
                ) : (
                  "Become a Founding Member"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feature cards for non-members */}
        {!isMember && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="opacity-60">
              <CardHeader>
                <Library className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg font-display">My Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Save and organise your stories. (Members only)</p>
              </CardContent>
            </Card>
            <Card className="opacity-60">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-secondary mb-2" />
                <CardTitle className="text-lg font-display">Create a Book</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Turn stories into a printable book. (Members only)</p>
              </CardContent>
            </Card>
            <Card className="opacity-60">
              <CardHeader>
                <Star className="h-8 w-8 text-accent mb-2" />
                <CardTitle className="text-lg font-display">Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Group stories by child or theme. (Members only)</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Member Dashboard */}
        {isMember && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "library" ? "default" : "outline"}
                onClick={() => setActiveTab("library")}
                size="sm"
              >
                <Library className="h-4 w-4 mr-1" /> My Library
              </Button>
              <Button
                variant={activeTab === "collections" ? "default" : "outline"}
                onClick={() => setActiveTab("collections")}
                size="sm"
              >
                <Star className="h-4 w-4 mr-1" /> Collections
              </Button>
            </div>

            {/* Library Tab */}
            {activeTab === "library" && (
              <>
                {/* Filter by collection */}
                <div className="flex items-center gap-3 mb-4">
                  <Select value={filterCollection} onValueChange={setFilterCollection}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All stories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stories</SelectItem>
                      <SelectItem value="uncategorized">Uncategorised</SelectItem>
                      {collections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    {filteredQuestions.length} {filteredQuestions.length === 1 ? "story" : "stories"}
                  </span>
                </div>

                {loadingData ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <img src="/metaphor-images/owl_watercolor-2.png" alt="" className="w-20 h-20 mx-auto mb-4 opacity-60" />
                      <p className="font-display text-lg font-semibold mb-1">No saved stories yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate a story and click "Save to Library" to see it here.
                      </p>
                      <Button asChild>
                        <Link to="/ask">Ask a Question</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredQuestions.map((sq) => (
                      <Card key={sq.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-start gap-4">
                          {sq.questions.image_url && (
                            <img
                              src={sq.questions.image_url}
                              alt=""
                              className="w-14 h-14 rounded-xl object-contain shrink-0"
                              style={{ mixBlendMode: "multiply" }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/result/${sq.question_id}`}
                              className="font-display font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                            >
                              {sq.questions.metaphor_title}
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              "{sq.questions.question_text}" — {sq.questions.child_name}, age {sq.questions.child_age}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Select
                                value={sq.collection_id || "none"}
                                onValueChange={(val) => moveToCollection(sq.id, val === "none" ? null : val)}
                              >
                                <SelectTrigger className="h-7 text-xs w-36">
                                  <SelectValue placeholder="No collection" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No collection</SelectItem>
                                  {collections.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => togglePublic(sq)}
                              title={sq.questions.is_public ? "Make private" : "Make public"}
                            >
                              {sq.questions.is_public ? (
                                <Eye className="h-4 w-4 text-sage" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/60 hover:text-destructive"
                              onClick={() => removeSaved(sq.id)}
                              title="Remove from library"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Collections Tab */}
            {activeTab === "collections" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {showNewCollection ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g. Ruby's Questions"
                        className="w-56 h-9"
                        onKeyDown={(e) => e.key === "Enter" && createCollection()}
                        autoFocus
                      />
                      <Button size="sm" onClick={createCollection}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNewCollection(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setShowNewCollection(true)}>
                      <Plus className="h-4 w-4 mr-1" /> New Collection
                    </Button>
                  )}
                </div>

                {collections.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FolderPlus className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="font-display text-lg font-semibold mb-1">No collections yet</p>
                      <p className="text-sm text-muted-foreground">
                        Create a collection to organise stories by child or theme.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {collections.map((c) => {
                      const count = savedQuestions.filter((sq) => sq.collection_id === c.id).length;
                      return (
                        <Card key={c.id}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <Star className="h-6 w-6 text-accent shrink-0" />
                            <div className="flex-1 min-w-0">
                              {editingCollection === c.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8 text-sm w-48"
                                    onKeyDown={(e) => e.key === "Enter" && renameCollection(c.id)}
                                    autoFocus
                                  />
                                  <Button size="sm" variant="ghost" onClick={() => renameCollection(c.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingCollection(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <p className="font-display font-semibold text-sm">{c.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {count} {count === 1 ? "story" : "stories"}
                                  </p>
                                </>
                              )}
                            </div>
                            {editingCollection !== c.id && (
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingCollection(c.id);
                                    setEditName(c.name);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive/60 hover:text-destructive"
                                  onClick={() => deleteCollection(c.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
