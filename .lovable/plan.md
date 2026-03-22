

## Plan: Book Export, Child Profiles, and Share Card Upgrades

### 1. Fix Child Profile Saving

The `onRefresh` prop is typed as `() => void` but `fetchData` is `async`. Change the prop type to `() => void | Promise<void>` so `await onRefresh()` works correctly. Also add a try/catch around the await to prevent stuck spinners if fetchData throws.

**File**: `src/components/ChildProfileManager.tsx`

### 2. Simplify Book Export and Instructions

Replace the 6-step Bulk Create instructions with simpler copy-paste workflow:

- **Step 1**: Select stories from your library
- **Step 2**: Export CSV — downloads a file with columns: `Question`, `Answer`, `Child Name`, `Age` (with "Age" before the number, e.g. "Age 5")
- **Step 3**: Open the Canva template link to get your own copy
- **Step 4**: Copy and paste questions and stories from the CSV into the template pages

Update `exportToCanva` function:
- Change CSV headers to: `Question`, `Answer`, `Child Name`, `Age`
- Format Age column as `Age 5` (with the word "Age" prefix)
- Remove theme column
- Keep story_title as a separate field or merge into Answer

**File**: `src/pages/DashboardPage.tsx`

### 3. Redesign Instagram Share Cards (Premium Value)

The current cards are basic canvas drawings that don't justify a paywall. Redesign to make them genuinely valuable:

**Question Card** (free): Keep as-is but improve — larger image, better typography.

**Story Card** (paid): Complete redesign:
- Full bleed watercolor illustration as hero (large, centered)
- Elegant typographic treatment of the question as a pull-quote
- Story title in display font with decorative flourish
- First paragraph of story in flowing serif-style text
- Child name badge with soft gradient
- Branded footer with subtle pattern

**Instagram Carousel** (paid): Make each slide distinctly different and valuable:
- **Slide 1**: Full-bleed image with question overlaid in elegant type — looks like a magazine cover
- **Slide 2**: Story title page — large decorative title, small illustration, opening paragraph
- **Slide 3**: Story continuation — flowing text with pull-quote styling, different background tone
- **Slide 4**: "For Parents" insight card with the parent explanation in a visually distinct treatment
- **Slide 5**: CTA slide with branding

Key improvements:
- Draw the watercolor image much larger (500px+ instead of 360px)
- Use different background colors per slide (cream → sage → blue → coral → gold)
- Add decorative watercolor-style borders/frames using canvas arcs and gradients
- Add subtle pattern overlays (dots, lines) for visual richness
- Make text layouts feel editorial, not template-y
- Each slide should feel like a different page from a picture book

**File**: `src/components/StoryCardGenerator.tsx`

### 4. Keep AI Image Generation Active

No changes needed — the edge function already generates images via the AI gateway. The user wants to confirm this still works alongside the uploaded asset library. The current logic tries to match keywords first, then generates if no match. This is correct.

### Summary of Files Changed

| File | Change |
|------|--------|
| `src/components/ChildProfileManager.tsx` | Fix prop type, add error handling around save |
| `src/pages/DashboardPage.tsx` | Simplify book instructions, update CSV export headers |
| `src/components/StoryCardGenerator.tsx` | Major redesign of share cards for premium value |

