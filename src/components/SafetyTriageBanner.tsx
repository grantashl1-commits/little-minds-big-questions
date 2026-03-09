import { AlertTriangle, ExternalLink } from "lucide-react";

interface SafetyFlags {
  self_harm?: boolean;
  abuse?: boolean;
  sextortion?: boolean;
  sexual_content?: boolean;
  bullying?: boolean;
  eating_disorder?: boolean;
  substance?: boolean;
}

const RESOURCES: Record<string, { label: string; url: string; org: string }[]> = {
  self_harm: [
    { label: "Teen Depression & Self-Harm", url: "https://kidshealth.org/en/parents/teen-depression.html", org: "KidsHealth" },
    { label: "Crisis Text Line", url: "https://www.crisistextline.org/", org: "Crisis Text Line" },
  ],
  abuse: [
    { label: "Child Abuse Resources", url: "https://www.healthychildren.org/English/safety-prevention/at-home/Pages/What-to-Know-about-Child-Abuse.aspx", org: "AAP" },
  ],
  sextortion: [
    { label: "Sextortion Parent Guide", url: "https://www.connectsafely.org/sextortion/", org: "ConnectSafely" },
  ],
  bullying: [
    { label: "Cyberbullying Guide", url: "https://www.commonsensemedia.org/articles/cyberbullying", org: "Common Sense Media" },
    { label: "Anti-Bullying Resources", url: "https://kidshealth.org/en/parents/bullies.html", org: "KidsHealth" },
  ],
  sexual_content: [
    { label: "Talking About Sex & Sexuality", url: "https://www.plannedparenthood.org/learn/parents/talking-to-kids-about-sex-and-sexuality", org: "Planned Parenthood" },
  ],
  eating_disorder: [
    { label: "Eating Disorders in Children", url: "https://kidshealth.org/en/parents/eating-disorders.html", org: "KidsHealth" },
  ],
  substance: [
    { label: "Talking to Kids About Drugs", url: "https://kidshealth.org/en/parents/talk-about-drugs.html", org: "KidsHealth" },
  ],
};

const FLAG_LABELS: Record<string, string> = {
  self_harm: "Self-harm or suicidal ideation",
  abuse: "Abuse concerns",
  sextortion: "Online exploitation",
  sexual_content: "Sensitive sexual content",
  bullying: "Bullying or cyberbullying",
  eating_disorder: "Eating disorder concerns",
  substance: "Substance use",
};

export function hasActiveFlags(flags: SafetyFlags | undefined | null): boolean {
  if (!flags) return false;
  return Object.values(flags).some(Boolean);
}

export function getActiveFlags(flags: SafetyFlags | undefined | null): string[] {
  if (!flags) return [];
  return Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k);
}

const SafetyTriageBanner = ({ safetyFlags }: { safetyFlags: SafetyFlags }) => {
  const activeFlags = getActiveFlags(safetyFlags);
  if (activeFlags.length === 0) return null;

  const allResources = activeFlags.flatMap(flag => RESOURCES[flag] || []);
  const uniqueResources = allResources.filter(
    (r, i, arr) => arr.findIndex(x => x.url === r.url) === i
  );

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display font-bold text-base text-amber-900 dark:text-amber-200 mb-1">
            This topic may need extra support
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            This story touches on sensitive topics. While we've provided a gentle, age-appropriate response,
            you may want to speak with a professional for additional guidance.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {activeFlags.map(flag => (
          <span
            key={flag}
            className="inline-block text-xs font-display font-semibold bg-amber-200/60 dark:bg-amber-800/40 text-amber-900 dark:text-amber-200 rounded-full px-3 py-1 mr-2"
          >
            {FLAG_LABELS[flag] || flag}
          </span>
        ))}
      </div>

      {uniqueResources.length > 0 && (
        <div>
          <p className="text-xs font-display font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Helpful resources:
          </p>
          <div className="space-y-1.5">
            {uniqueResources.map(r => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 hover:text-amber-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>{r.label}</span>
                <span className="text-xs text-amber-600 dark:text-amber-400">({r.org})</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-amber-700 dark:text-amber-400 mt-4 italic">
        Little Minds BIG Questions is not a substitute for professional therapeutic, medical, or psychological advice.
      </p>
    </div>
  );
};

export default SafetyTriageBanner;
