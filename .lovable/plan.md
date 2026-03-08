

## Plan: Monetization & Growth Improvements

This is a large set of changes spanning 5 areas. I'll implement the highest-impact items that are practical to build now.

---

### What We'll Build

**1. Child Profiles System**
- New `child_profiles` database table with RLS
- Add `child_profile_id` column to `questions` table
- Dashboard "Children" tab to create/edit/delete child profiles (name, age, emoji avatar)
- Child selector dropdown on AskPage to prefill name/age
- Child filter on Dashboard library view

**2. Emotional Save Flow (Conversion Upgrade)**
- When a non-member clicks "Save to Library" on ResultPage, show a modal instead of a disabled button
- Modal shows: "Save this story for [child_name]", a preview of what a story library looks like, and a CTA: "Create My Child's Story Library — $10"
- When a member saves, toast shows "Saved to [child_name]'s Story Library" instead of generic "Saved to library!"

**3. Reframed Membership CTA**
- Update MembershipCTA component to use ownership-framed language
- Free vs Member comparison layout
- CTA button: "Create My Child's Story Library" instead of "Become a Founding Member"

**4. Weekly Question of the Week (Homepage Section)**
- New `weekly_questions` table
- Homepage section showing a curated featured question with illustration, story preview, and share button
- Admin-only UI (behind member role check for now) to generate a weekly question

**5. Bedtime Mode (Scoped Down)**
- Add a "Bedtime Mode" toggle on the ReadToMe component that switches to warm dark background, slower narration label, and calming UI treatment on the story result page

---

### Database Changes

```sql
-- Child profiles
CREATE TABLE public.child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  age integer,
  avatar_emoji text DEFAULT '🦋',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own child_profiles" ON public.child_profiles FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Link questions to child profiles
ALTER TABLE public.questions ADD COLUMN child_profile_id uuid REFERENCES public.child_profiles(id);

-- Weekly questions
CREATE TABLE public.weekly_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  story text NOT NULL,
  story_title text,
  image_url text,
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.weekly_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read weekly_questions" ON public.weekly_questions FOR SELECT USING (true);
```

### Files to Create/Edit

| File | Change |
|------|--------|
| `src/pages/ResultPage.tsx` | Replace disabled save button with upgrade modal for non-members; personalized save toast |
| `src/components/MembershipCTA.tsx` | Reframe copy to ownership language, Free vs Member comparison |
| `src/components/SaveUpgradeModal.tsx` | **New** — modal shown when free users try to save |
| `src/components/ChildProfileManager.tsx` | **New** — CRUD UI for child profiles in dashboard |
| `src/components/WeeklyQuestion.tsx` | **New** — homepage "Question of the Week" section |
| `src/pages/DashboardPage.tsx` | Add "Children" tab, child filter in library, personalized labels |
| `src/pages/AskPage.tsx` | Child profile selector dropdown to prefill name/age |
| `src/pages/Index.tsx` | Add WeeklyQuestion component |
| `src/components/ReadToMe.tsx` | Bedtime mode toggle with warm dark styling |

### Priority Order
1. Database migrations (child_profiles, weekly_questions, questions column)
2. Child Profiles (Dashboard + AskPage integration)
3. Emotional Save Flow (SaveUpgradeModal + personalized toasts)
4. Reframed MembershipCTA
5. Weekly Question homepage section
6. Bedtime Mode on ReadToMe

