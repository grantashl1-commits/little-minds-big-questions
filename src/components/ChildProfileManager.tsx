import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Check, X, Baby } from "lucide-react";
import { toast } from "sonner";

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  avatar_emoji: string;
  created_at: string;
}

const EMOJI_OPTIONS = ["🦋", "🌟", "🐰", "🦊", "🐢", "🐳", "🦉", "🌈", "🚀", "🎨"];

interface Props {
  profiles: ChildProfile[];
  onRefresh: () => void;
  storyCounts?: Record<string, number>;
}

const ChildProfileManager = ({ profiles, onRefresh }: Props) => {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", age: "", emoji: "🦋" });

  const resetForm = () => {
    setForm({ name: "", age: "", emoji: "🦋" });
    setShowAdd(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !user) return;
    const { error } = await supabase.from("child_profiles").insert({
      user_id: user.id,
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      avatar_emoji: form.emoji,
    });
    if (error) toast.error("Could not create profile");
    else {
      toast.success(`${form.name}'s profile created!`);
      resetForm();
      onRefresh();
    }
  };

  const handleUpdate = async (id: string) => {
    if (!form.name.trim()) return;
    const { error } = await supabase.from("child_profiles").update({
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      avatar_emoji: form.emoji,
    }).eq("id", id);
    if (error) toast.error("Could not update");
    else {
      resetForm();
      onRefresh();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from("child_profiles").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else {
      toast.success(`${name}'s profile removed`);
      onRefresh();
    }
  };

  const startEdit = (p: ChildProfile) => {
    setEditingId(p.id);
    setForm({ name: p.name, age: p.age?.toString() || "", emoji: p.avatar_emoji || "🦋" });
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {!showAdd && !editingId && (
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowAdd(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Child
          </Button>
        )}
      </div>

      {/* Add / Edit form */}
      {(showAdd || editingId) && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <p className="font-display font-semibold text-sm">
              {editingId ? "Edit Profile" : "New Child Profile"}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Child's name"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="flex-1"
                autoFocus
              />
              <Input
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))}
                className="w-20"
                min={2}
                max={10}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    form.emoji === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}>
                <Check className="h-4 w-4 mr-1" /> {editingId ? "Save" : "Create"}
              </Button>
              <Button size="sm" variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile list */}
      {profiles.length === 0 && !showAdd ? (
        <Card className="text-center py-12">
          <CardContent>
            <Baby className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="font-display text-lg font-semibold mb-1">No child profiles yet</p>
            <p className="text-sm text-muted-foreground">
              Create a profile for each child to personalise their story library.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-3xl">{p.avatar_emoji || "🦋"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.age ? `Age ${p.age}` : "Age not set"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/60 hover:text-destructive"
                    onClick={() => handleDelete(p.id, p.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildProfileManager;
