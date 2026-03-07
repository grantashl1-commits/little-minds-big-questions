

## Plan: Voice Playback + Transcript Confirmation Flow, Instagram Feed, and Instagram Publishing

### 1. Improved Voice Recording Flow (VoiceRecorder + AskChildPage)

**Current problem:** After recording, the user jumps straight to a form with an empty transcription field. No playback, no confirmation step.

**New flow after recording stops:**

1. Show **playback controls** (Play/Pause button with audio waveform indicator) so the parent/child can listen back
2. Show a **transcript box** — attempt real transcription via an edge function using Lovable AI (send the audio blob, get text back)
3. Show two clear options:
   - **"Yes, this is correct"** checkbox/button — accepts the transcript and proceeds to the details form
   - **"No, this is what they asked"** — reveals an editable text field where the parent types the actual question
4. Only after confirmation, show the remaining form fields (name, age, context, submit)

**Files to modify:**
- `src/components/VoiceRecorder.tsx` — Add a "reviewed" state with playback + transcript display + confirm/correct UI. The component will now have states: `idle` → `recording` → `reviewing` → `confirmed`
- `src/pages/AskChildPage.tsx` — Update to receive confirmed transcription. Remove the duplicate "Did we hear this right?" section since VoiceRecorder now handles it
- Create `supabase/functions/transcribe-audio/index.ts` — Edge function that takes audio blob, sends to Lovable AI gateway for transcription, returns text

### 2. Instagram Feed Section on Homepage

Add a new `InstagramFeed` component on the homepage showing a grid of recent public question tiles styled like an Instagram profile feed.

**Implementation:**
- Create `src/components/InstagramFeed.tsx`
- Query recent public questions from the database (limit 9, ordered by `created_at` desc)
- Display as a 3x3 grid of square tiles with the child's question text overlaid on a pastel background
- Header: "@littlemindsbigquestions" with Instagram icon
- Each tile links to the result page
- Add to `Index.tsx` between FeaturedQuestions and ThemeGrid

### 3. Instagram Auto-Publishing

**Short answer: There is no available connector for Instagram.** The Instagram Graph API requires a Facebook Business account, a connected Instagram Professional account, and a Facebook App with `instagram_content_publish` permissions. This is a complex OAuth flow that can't be automated through a simple connector.

**What I recommend instead:**
- Generate the tiles and make them easy to download (already partially built)
- Add a "Share to Instagram" button that copies the caption text and opens Instagram in a new tab
- For future automation, this would require connecting a Meta/Facebook developer app — I'll note this as a future premium feature

### Technical Details

**New edge function `transcribe-audio`:**
- Accepts audio blob via POST (multipart or base64)
- Uses Lovable AI gateway with a Gemini model that supports audio input
- Returns `{ transcription: string }`

**Database:** No schema changes needed.

**New/modified files:**
- `supabase/functions/transcribe-audio/index.ts` (new)
- `src/components/VoiceRecorder.tsx` (rewrite with reviewing state)
- `src/pages/AskChildPage.tsx` (simplify form, receive confirmed text)
- `src/components/InstagramFeed.tsx` (new)
- `src/pages/Index.tsx` (add InstagramFeed)

