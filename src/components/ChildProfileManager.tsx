import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Check, X, Baby, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  avatar_emoji: string | null;
  created_at: string | null;
}

interface Props {
  profiles: ChildProfile[];
  onRefresh: () => void | Promise<void>;
  storyCounts?: Record<string, number>;
}

const ChildProfileManager = ({ profiles, onRefresh, storyCounts = {} }: Props) => {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", age: "" });
  const [saving, setSaving] = useState<"create" | "update" | "delete" | null>(null);

  const resetForm = () => {
    setForm({ name: "", age: "" });
    setShowAdd(false);
    setEditingId(null);
  };

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "C";

  const handleCreate = async () => {
    if (!form.name.trim() || !user) return;
    const parsedAge = form.age === "" ? null : Number(form.age);
    if (parsedAge !== null && (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 18)) {
      toast.error("Please enter a valid age between 0 and 18.");
      return;
    }

    setSaving("create");
    try {
      const { error } = await supabase.from("child_profiles").insert({
        user_id: user.id,
        name: form.name.trim(),
        age: parsedAge,
      });

      if (error) {
        toast.error(error.message || "Could not create profile");
      } else {
        toast.success(`${form.name}'s profile saved!`);
        resetForm();
        try {
          await onRefresh();
        } catch {
          toast.error("Profile saved, but the dashboard did not refresh. Please reload once.");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!form.name.trim()) return;
    const parsedAge = form.age === "" ? null : Number(form.age);
    if (parsedAge !== null && (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 18)) {
      toast.error("Please enter a valid age between 0 and 18.");
      return;
    }

    setSaving("update");
    try {
      const { error } = await supabase.from("child_profiles").update({
        name: form.name.trim(),
        age: parsedAge,
      }).eq("id", id);

      if (error) {
        toast.error(error.message || "Could not update");
      } else {
        toast.success(`${form.name}'s profile updated`);
        resetForm();
        try {
          await onRefresh();
        } catch {
          toast.error("Profile updated, but the dashboard did not refresh. Please reload once.");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setSaving("delete");
    try {
      const { error } = await supabase.from("child_profiles").delete().eq("id", id);
      if (error) toast.error(error.message || "Could not delete");
      else {
        toast.success(`${name}'s profile removed`);
        try {
          await onRefresh();
        } catch {
          toast.error("Profile removed, but the dashboard did not refresh. Please reload once.");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const startEdit = (p: ChildProfile) => {
    setEditingId(p.id);
    setForm({ name: p.name, age: p.age?.toString() || "" });
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
                min={0}
                max={18}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={saving !== null} onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}>
                {saving === "create" || saving === "update" ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                {saving === "create" || saving === "update" ? "Saving..." : editingId ? "Save" : "Create"}
              </Button>
              <Button size="sm" variant="ghost" disabled={saving !== null} onClick={resetForm}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Child profiles save to your dashboard automatically.</p>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.age ? `Age ${p.age}` : "Age not set"}
                    {storyCounts[p.id] ? ` · ${storyCounts[p.id]} ${storyCounts[p.id] === 1 ? "story" : "stories"}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={saving === "delete"}
                    className="h-8 w-8 text-destructive/60 hover:text-destructive"
                    onClick={() => handleDelete(p.id, p.name)}
                  >
                    {saving === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
