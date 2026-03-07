

## Plan: Navigation Login, Private Stories Gating, Story Deletion, Content Safety, and Voice Recorder Fix

### 1. Add Login/Dashboard Link in Header (Navbar)
The navbar already shows "Dashboard" + logout for authenticated users and "Log In" for guests. No changes needed here -- this is already implemented in `Navbar.tsx`.

### 2. Gate Private Stories Behind Paid Plan
**Files:** `AskPage.tsx`, `AskChildPage.tsx`

Currently the "Make this answer public" checkbox is freely togglable. Change it so:
- Non-members: checkbox is locked to `true` (public). Show a message like "Private stories are a members-only feature" with an upgrade link.
- Members: can freely toggle public/private.

Import `useAuth` in both pages and conditionally disable the checkbox.

### 3. Allow Users to Delete Their Own Stories
**Files:** `ResultPage.tsx`, database migration

- Add a **Delete Story** button on `ResultPage` visible only when the user is the creator (requires adding a `user_id` column to `questions` table or matching by saved_questions).
- **Problem:** The `questions` table has no `user_id` column, so we can't tell who created a story.
- **Migration:** Add nullable `user_id` column to `questions` table and an RLS policy allowing users to delete their own questions.
- **Code:** Set `user_id` to `user?.id` on insert in `AskPage` and `AskChildPage`. Show delete button on `ResultPage` when `question.user_id === user?.id`. Add confirmation dialog before deletion.
- Also delete related `question_themes`, `saved_questions`, `analytics`, and `content_assets` rows (or use CASCADE).

### 4. AI Content Safety / Inappropriate Question Filtering
**File:** `supabase/functions/generate-answer/index.ts`

Currently the system prompt has no explicit content safety rules. The AI is instructed to be "gentle" and "comforting" but there's no rejection mechanism for inappropriate input.

**Changes to the system prompt:**
- Add explicit content safety instructions: "If the question contains profanity, sexual content, violence, hate speech, or is clearly not a genuine child's question, do NOT generate a story. Instead return a special response indicating the question was inappropriate."
- Add a new optional field `rejected: boolean` and `rejection_reason: string` to the tool schema.
- In the edge function, check if `result.rejected === true` and return an error response.
- In `AskPage` and `AskChildPage`, handle this error gracefully with a friendly message.

### 5. Fix Voice Recorder Not Loading / Not Showing Confirmation Boxes
**File:** `src/components/VoiceRecorder.tsx`

The VoiceRecorder component code looks correct structurally. The issue is likely that the `transcribe-audio` edge function is failing silently, causing the component to get stuck. Need to investigate:
- Check if `audio/webm` MIME type is supported by the browser's `MediaRecorder`.
- Add fallback MIME type handling (try `audio/webm;codecs=opus`, then `audio/mp4`, then default).
- Ensure error states are handled so the review UI always shows even if transcription fails.
- The `transcribeAudio` function already has error handling that sets transcript to `""`, but the UI should still show the review state with the "Is this right?" buttons regardless of transcription result -- which it does. Let me check if there's a deployment issue with the edge function.

The most likely cause: the `MediaRecorder` constructor may throw if `audio/webm` isn't supported (e.g., on Safari/iOS). Add MIME type detection with fallback.

### Summary of Changes

| Task | Files |
|------|-------|
| Gate private stories to members | `AskPage.tsx`, `AskChildPage.tsx` |
| Add `user_id` to questions + delete capability | DB migration, `AskPage.tsx`, `AskChildPage.tsx`, `ResultPage.tsx` |
| Content safety in AI prompt | `generate-answer/index.ts` |
| Fix voice recorder MIME type | `VoiceRecorder.tsx` |

### Technical Details

**Database migration:**
```sql
ALTER TABLE public.questions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE POLICY "Users can delete own questions"
ON public.questions FOR DELETE TO authenticated
USING (user_id = auth.uid());
```

**MIME type fallback for VoiceRecorder:**
```typescript
const getSupportedMimeType = () => {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
};
```

**Content safety addition to system prompt:**
Add to the generate-answer system prompt: instructions to detect and reject inappropriate content, returning `rejected: true` with a reason instead of generating a story.

