# DepChip Website

Modernized marketing website for DepChip using plain HTML, CSS, and lightweight vanilla JavaScript.

- Cleaner, premium SaaS-style landing page with stronger messaging and conversion flow
- Mobile-first responsive layout built around CSS Grid and Flexbox
- Centralized design system using CSS variables for color, spacing, typography, radius, and shadows
- Sticky responsive navigation with hamburger menu
- Improved sections for hero, services, portfolio, about, testimonials, FAQ, CTA, contact, and footer
- Lightweight scroll-reveal animations and polished hover/focus states
- Accessible semantics, clearer contrast, and better form feedback UI
- Removed dependency on legacy UI libraries from the main page experience

## Project Structure

- `index.html`: Main website markup and semantic content structure
- `css/style.css`: Design system, responsive layout, and component styling
- `js/main.js`: Mobile navigation, active link highlighting, scroll reveal, and contact form handling
- `assets/`: Images, icons, logos, and media files used across the site

## Design Notes

- Typography uses `Inter` for body copy and `Space Grotesk` for display headings
- Visual direction is inspired by modern SaaS brands with layered gradients, glassy surfaces, and strong spacing
- Components are designed to feel premium while staying fast and maintainable
- Motion is subtle and purposeful, with `prefers-reduced-motion` support included

## Key UX Improvements

- Stronger hero with clear value proposition and CTAs
- Better scanability through improved hierarchy and card-based content
- More polished contact section with inline success and error messages
- Footer upgraded with better organization and clearer next steps
- Navigation stays usable and accessible across desktop and mobile

## How To Run

Open `index.html` in a browser, or serve the project locally with any static file server.

Example:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Notes

- The contact form submits through Formspree using the existing endpoint.