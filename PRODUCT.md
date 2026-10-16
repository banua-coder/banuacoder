# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 6 static site, Tailwind 4, MDX content collections, GSAP + Lenis for motion, satori for build-time OG images. Bilingual: Indonesian default, English under /en/. Confirmed by user: keep the id/en route structure.

## Product

banuacoder.com is the company site of PT Banua Coder Indonesia, an engineering-led software house in Palu, Central Sulawesi, founded 2019 by Fajrian Aidil Pratama (Ryan). It sells website, mobile app (Flutter), internal operational systems, UI/UX, branding, social media, MVP builds, product engineering support and (new) motion/app-demo video. It also promotes Archipelago, its own licensed Flutter monorepo starter kit (archipelago.banuacoder.com).

## Users

The user confirmed an equal split. One group is Indonesian business owners, startups and government agencies (pemda, instansi) that choose a build partner. The other group is English-reading leads and Flutter developers who can license Archipelago. Primary job: decide whether Banua Coder is credible enough to book a call or request an estimate.

## Positioning

Engineering depth with real shipped proof. The proof covers public-sector systems, consumer apps, performance audits and open-source SDKs. The company works from outside the Jakarta and Bandung default. It acts as a technology partner, not a task vendor.

## Constraints and assets

- Keep id (default) + /en/ bilingual routes and existing URLs.
- Colour palette is open to replacement (confirmed). Logo mark and wordmark are brand assets: BC monogram with an arc, rounded geometric wordmark "BanuaCoder". Source files: ~/Documents/Projects/Design/BANUA CODER LOGO/ (BANUACODER.svg, PNG1-6, JPG1-6, STAMP/, STATIONERY.pdf, Logo Concept 2 pdf) and src/assets/brand/.
- Real proof only: no invented clients, numbers, testimonials or pricing. Portfolio and blog content live in src/content.
- Prose uses the nickname "Ryan". Schema.org, meta and page titles use the legal name "Fajrian Aidil Pratama".
- Conversion: schedule a call (external scheduler, URL still a placeholder in src/data/contact.ts), WhatsApp, and the /estimate wizard.
- banua-coder-ops is an internal-only platform (OIDC employees, no client accounts), so the public site cannot post to it without a new public endpoint.

## Accessibility

WCAG AA contrast, visible focus, reduced-motion support, dark mode, usable on mid-range phones and slow connections in Indonesia.
