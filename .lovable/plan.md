

## Plan: Navigation Login Visibility, Footer Auth Links, and Membership Pricing Promotion

### Problem
1. The navbar "Log In" button exists in code but is not visible on mobile (411px viewport — buttons overflow without a mobile menu).
2. Footer has no login/sign up links.
3. No public-facing description of the $20 NZD membership pricing or the 50% off founding member offer — this info is only visible inside the dashboard after login.

### Changes

#### 1. Navbar — Mobile-Responsive with Login Visibility
**File:** `src/components/Navbar.tsx`

Add a mobile hamburger menu using a Sheet (slide-out drawer) for small screens. On desktop, keep the current layout. Ensure "Log In" / "Dashboard" is always visible.

- Import `Sheet`, `SheetTrigger`, `SheetContent` from UI components and `Menu` icon from lucide
- Wrap nav links in a responsive layout: hidden on mobile, visible on `md:` and up
- Add a hamburger `Menu` button visible only on mobile that opens a Sheet with all nav links vertically stacked
- Both desktop and mobile views show: Browse, Ask a Question, Log In (or Dashboard + Log Out)

#### 2. Footer — Add Login/Sign Up and Dashboard Links
**File:** `src/components/Footer.tsx`

- Import `useAuth` from AuthContext
- Add a new column "Account" in the footer grid with conditional links:
  - Logged out: "Log In", "Sign Up"
  - Logged in: "Dashboard", "Log Out"

#### 3. Membership Pricing Section on Homepage
**File:** `src/pages/Index.tsx` + new component `src/components/MembershipCTA.tsx`

Create a new `MembershipCTA` component placed on the homepage (between FeaturedQuestions and InstagramFeed) that advertises the founding member offer:

- Headline: "Founding Member Special — 50% Off"
- Original price $20 NZD crossed out, current price $10 NZD one-time
- Bullet list of what members get:
  - Save stories to a private library
  - Keep stories private (only you have the link)
  - "Read to Me" — AI story narration in bedtime & daytime voices
  - Download story cards & Instagram carousels
  - Create printable storybooks
  - Organise stories into collections
- CTA button: "Become a Founding Member" → redirects to `/auth` if not logged in, or invokes checkout if logged in
- Warm, on-brand styling matching the existing card/accent design

#### 4. Update Footer Grid to 4 Columns
Change from `sm:grid-cols-3` to `sm:grid-cols-4` to accommodate the new Account column.

### Files Modified
| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Add mobile hamburger menu with Sheet |
| `src/components/Footer.tsx` | Add Account column with auth links |
| `src/components/MembershipCTA.tsx` | New — pricing/benefits section |
| `src/pages/Index.tsx` | Add MembershipCTA to homepage |

