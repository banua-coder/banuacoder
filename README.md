# Banua Coder

Company website for Banua Coder — engineering-led technology partner.

## Stack
- Astro 6 (static output)
- Tailwind CSS v4
- MDX content collections with Zod schemas
- i18n routing (Bahasa Indonesia default, English at `/en/`)
- pnpm

## Commands

| Command | Description |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm run build` | Build production site to `./dist/` |
| `pnpm run preview` | Preview the build locally |
| `pnpm exec astro check` | Type-check Astro + content schemas |
| `pnpm exec astro sync` | Regenerate content collection types |

## Branch model (git-flow)
- `main` — production
- `develop` — integration
- `feature/*` — feature branches, PR'd to `develop`
- `legacy/laravel-cms` — archived Laravel template (do not touch)

## Project tracking
Beads is used for issue tracking — run `bd list` or `bd children banuacoder-jfp` for the redesign epic and milestones.

## Internal docs
Long-form planning lives in `docs/` (gitignored). The current redesign plan: `docs/plans/2026-05-08-banua-coder-redesign-design.md`.
