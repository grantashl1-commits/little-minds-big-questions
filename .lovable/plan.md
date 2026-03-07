

## Plan: Instagram Tiles, Logo Overhaul, Bigger Icons & Hero Image

### Key Answers First

- **Canva integration**: Not currently supported. There's no Canva connector available. You'd need to export designs from Canva and upload them here.
- **Instagram scraping**: Instagram blocks automated access (403). The Instagram feed on the homepage pulls from your own database of public questions — it doesn't pull from Instagram directly. To match your Canva tile designs, we'll restyle the feed tiles.
- **Pushing to Instagram**: Not possible automatically (requires Meta Business API with complex approval). The download tiles approach is the best path.

---

### 1. Logo Update — Use Uploaded Curved Text Logo

- Copy `user-uploads://5771-2.png` to `src/assets/logo-main.png`
- Update **Navbar**: Replace the seed image + text with the full logo image (sized ~40-48px height), remove the separate text "Little Minds BIG Questions"
- Update **Footer**: Same logo image treatment
- Remove the leaf/seed favicon reference in the navbar — the logo image replaces it entirely

### 2. Make All Watercolor Icons Much Bigger + Transparent Backgrounds

Currently icons are `w-12 h-12` to `w-20 h-20`. Changes:

- **HowItWorks.tsx**: Increase from `w-20 h-20` → `w-36 h-36` 
- **ThemeGrid.tsx**: Increase from `w-12 h-12` → `w-24 h-24`
- **AskPage.tsx**: Increase rabbit icon from `w-10 h-10` → `w-20 h-20`
- **BrowsePage.tsx**: Increase loading/empty icons from `w-16 h-16` → `w-28 h-28`
- **ResultPage.tsx**: Increase owl icon from `w-8 h-8` → `w-16 h-16`, generated image from `w-40/w-52` → `w-64/w-72`
- **InstagramFeed.tsx**: No icon changes (text-based tiles)

Note: The existing watercolor PNGs already have transparent backgrounds. Making them bigger will make the transparency more visible.

### 3. Generate Watercolor Hero Image — Child Looking Up at Sky

- Use the AI image generation endpoint (`google/gemini-2.5-flash-image`) via the edge function approach to generate a watercolor illustration of "a young child looking up into a vast sky, wondering, dreamy watercolour children's book style, soft pastels, transparent/white background"
- Save the generated image to `src/assets/hero-illustration.jpg` (replacing the current one)
- Update **HeroSection.tsx**: Ensure the image stays on the right side of the grid and doesn't overlap the CTA buttons (it's already in a `md:grid-cols-2` layout — just verify positioning)

### 4. Restyle Instagram Feed Tiles to Match Canva Design

Since we can't scrape Instagram, restyle the `InstagramFeed.tsx` tiles to look more like polished social media cards:

- Add a subtle border/shadow to each tile
- Include a small watercolor icon per tile (matched from theme or random from the collection)
- Use the cream background (`#F4E8D0`) with a white card overlay
- Add "Little Minds BIG Questions" branding text at bottom of each tile
- Make tiles feel like the Canva-style posts (clean, centered text, watercolor accent)

### Files to Modify

| File | Change |
|------|--------|
| `src/assets/logo-main.png` | New — uploaded logo |
| `src/assets/hero-illustration.jpg` | Replaced — AI-generated child looking at sky |
| `src/components/Navbar.tsx` | Logo image, remove seed icon + text |
| `src/components/Footer.tsx` | Logo image update |
| `src/components/HeroSection.tsx` | New hero image, verify right positioning |
| `src/components/HowItWorks.tsx` | Bigger icons (w-36) |
| `src/components/ThemeGrid.tsx` | Bigger icons (w-24) |
| `src/components/InstagramFeed.tsx` | Restyle tiles to match Canva aesthetic |
| `src/pages/AskPage.tsx` | Bigger icons |
| `src/pages/BrowsePage.tsx` | Bigger icons |
| `src/pages/ResultPage.tsx` | Bigger icons + generated image |

### Edge Function for Hero Image Generation

- Create a one-time call in the implementation to generate the hero watercolor via `google/gemini-2.5-flash-image` and save it as a static asset

