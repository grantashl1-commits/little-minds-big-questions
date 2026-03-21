import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface ParentScript {
  theme: string;
  what_to_say: string;
  what_to_avoid: string;
  resource_links: string[];
}

const ParentScriptPanel = ({ themes }: { themes: string[] }) => {
  const [scripts, setScripts] = useState<ParentScript[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (themes.length === 0) return;
    supabase
      .from("parent_scripts" as any)
      .select("theme, what_to_say, what_to_avoid, resource_links")
      .in("theme", themes)
      .then(({ data }) => {
        if (data) setScripts(data as unknown as ParentScript[]);
      });
  }, [themes]);

  if (scripts.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl storybook-shadow mb-8 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <img src="/metaphor-images/owl.png" alt="" className="w-10 h-10 object-contain" />
          <div>
            <h3 className="font-display font-bold text-base">Parent Guide</h3>
            <p className="text-xs text-muted-foreground">What to say and what to avoid</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6">
          {scripts.map(script => (
            <div key={script.theme} className="space-y-4">
              <div className="bg-sage/10 rounded-xl p-4">
                <h4 className="font-display font-semibold text-sm text-sage mb-2">✓ What to say</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{script.what_to_say}</p>
              </div>
              <div className="bg-destructive/5 rounded-xl p-4">
                <h4 className="font-display font-semibold text-sm text-destructive/80 mb-2">✗ What to avoid</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{script.what_to_avoid}</p>
              </div>
              {script.resource_links && script.resource_links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {script.resource_links.map((url: string) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Learn more
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentScriptPanel;
