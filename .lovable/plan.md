

## Issues Found & Plan

### 1. Child Profiles Tab — Visibility Bug
The Children tab (line 413-419) is nested inside `{isMember && (` on line 388. While your DB confirms you have the `member` role, this gate also hides the tab for all non-members unnecessarily. **Fix**: Move the Children tab outside the member gate so all logged-in users can manage child profiles. The Library, Collections, and Book tabs remain member-only.

### 2. Google Sign-In — Already Working
The "Continue with Google" button exists on `/auth` (lines 86-102). Since you're already logged in, you're redirected to `/dashboard` before seeing it. This is working correctly — no change needed.

### 3. Book Cover Page Generator
Add a "Download Cover" button to the Create Your Book tab that generates a 1080×1080 PNG book cover matching your uploaded PDF style:
- Sage green background
- Child's name in large display font: "[NAME]'S"
- Subtitle: "Answers to life's big questions"
- Pastel colored circles (pink, blue, purple, yellow)
- Uses the existing boy hero illustration
- Child name input field so users can personalise it

### 4. Girl Illustration
Use AI image generation (`google/gemini-3.1-flash-image-preview`) via an edge function to generate a watercolour girl illustration matching the boy's style — same pose (looking up at sky), same art style, transparent/white background. Save to storage and make available as a second cover option.

### Technical Approach

**DashboardPage.tsx changes:**
- Extract Children tab button outside `{isMember && (` block (move lines 413-419 before line 388)
- Add a cover generator section to the Book tab with:
  - Name input field
  - Boy/Girl illustration toggle
  - "Download Cover" button that renders a canvas-based 1080×1080 PNG

**New edge function: `generate-girl-illustration`**
- Calls `google/gemini-3.1-flash-image-preview` with prompt matching the boy's style
- Uploads result to storage
- Returns URL

**Book cover canvas logic** (in DashboardPage or new component):
- Sage green background (#A8D5BA)
- Large "[NAME]'S" text top-center
- "Answers to life's big questions" subtitle
- 4 pastel circles positioned like the PDF
- Boy or girl illustration composited from loaded image

### Files to modify
- `src/pages/DashboardPage.tsx` — move Children tab, add cover generator
- `supabase/functions/generate-girl-illustration/index.ts` — new edge function for girl art
- `public/metaphor-images/hero-girl.png` — generated girl illustration asset

