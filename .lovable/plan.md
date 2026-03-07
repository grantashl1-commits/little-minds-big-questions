

# Plan: Membership, Payments, TTS, and Book Creation

This is a large feature set. I recommend breaking it into **5 sequential phases** to keep each iteration manageable and testable.

---

## Phase 1: Authentication

**Database changes:**
- Create `profiles` table (id, user_id FK to auth.users, created_at)
- Create `user_roles` table (id, user_id FK to auth.users, role enum: 'member'/'admin')
- RLS policies so users can read/update their own profile
- Security definer `has_role()` function

**New pages/components:**
- `/auth` page with sign up / log in tabs (email + password)
- Auth context provider wrapping the app
- Navbar updates: show user avatar / Log Out when authenticated, Login/Sign Up when not
- `/dashboard` route (protected, placeholder for now)

**No auto-confirm** — users verify email before signing in.

---

## Phase 2: Stripe Payment (Founding Member)

**Requires enabling Stripe integration** via the Stripe tool first. This will expose the exact implementation pattern.

**Flow:**
- Membership pricing page / section showing "$20 ~~$20~~ $10 NZD — Founding Member Special"
- Stripe Checkout session (one-time $10 NZD payment)
- Webhook edge function: on `checkout.session.completed`, insert role `member` into `user_roles`
- Dashboard gate: check `has_role(uid, 'member')` to unlock member features

---

## Phase 3: Member Dashboard + Saved Library

**Database changes:**
- `saved_questions` table (user_id, question_id, collection_id nullable)
- `collections` table (id, user_id, name, created_at)
- RLS: users can only CRUD their own saved questions and collections

**Features:**
- `/dashboard` shows saved questions, collections, "Create Your Book" section
- "Save" button on ResultPage (members only)
- Toggle `is_public` on saved questions (members only)
- Collection management (create, rename, add questions)

---

## Phase 4: Read to Me (ElevenLabs TTS)

**Requires ElevenLabs connector** — will use the connector tool to link credentials.

**Edge function:** `text-to-speech` — receives story text, calls ElevenLabs API with a soft/calm voice (e.g. "Lily" or "Alice"), returns audio.

**UI on ResultPage:**
- "Read to Me" button with speaker icon
- Members: plays audio on click (pause/resume/replay controls)
- Free users: button visible but disabled with lock icon + "Upgrade to unlock"
- Voice mode toggle: Bedtime (slower, stability 0.7) vs Bright Daytime (normal pace)
- Loading state: "Preparing story audio..."
- Optional: sentence highlighting during playback

---

## Phase 5: Book Creation + Canva Export

**UI in dashboard:**
- "Create Your Book" section — select saved questions
- Preview formatted story pages (question, story, illustration, child info)
- "Export to Canva Book Template" button
- Exports structured JSON/text that user pastes into Canva
- Explanation text about Canva handling printing/shipping

---

## Phase 6: Member Benefits Comparison

**New component** on homepage or dedicated `/pricing` page:
- Side-by-side Free vs Member comparison table
- CTA button linking to Stripe checkout
- Consistent watercolor branding

---

## Implementation Order

Each phase should be a separate conversation turn for manageability:

1. **Phase 1** — Auth (required foundation)
2. **Phase 2** — Stripe (requires enabling Stripe tool first)
3. **Phase 3** — Dashboard + library
4. **Phase 4** — TTS (requires ElevenLabs connector)
5. **Phase 5** — Book export
6. **Phase 6** — Pricing comparison UI

**Shall I proceed with Phase 1 (Authentication) first?**

