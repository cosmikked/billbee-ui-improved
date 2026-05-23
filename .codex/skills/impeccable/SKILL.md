---
name: impeccable
description: Frontend design, redesign, critique, and refinement for Codex. Use when Codex needs to shape, craft, audit, critique, polish, clarify, harden, animate, colorize, typeset, adapt, or otherwise improve websites, landing pages, dashboards, product UI, app shells, components, forms, onboarding, settings, empty states, or design systems. Covers UX review, hierarchy, information architecture, typography, spacing, layout, color, motion, accessibility, responsiveness, performance-minded UI cleanup, and anti-pattern removal. Not for backend-only or non-UI tasks.
---

# Impeccable

## Overview

Design and iterate production-grade frontend interfaces in a Codex-native workflow. Make committed design choices, implement them in real code, and avoid generic "AI UI" patterns.

## Workflow

### 1. Load context first

Search for `PRODUCT.md` first, then `DESIGN.md`. Check the repo root, `docs/`, `.codex/`, and the feature area you are editing. If they exist, read them before proposing visual direction or editing files.

If the files are missing, infer the product purpose, audience, and existing visual language from the codebase. State the missing context briefly, then proceed.

### 2. Pick the register

Decide whether the surface is `brand` or `product`.

- `brand`: the design itself is the deliverable, such as landing pages, marketing sites, campaigns, portfolios, and editorial surfaces.
- `product`: the design serves an active task, such as dashboards, settings, tables, internal tools, authenticated app screens, and workflows.

Then read the matching reference:

- [references/brand.md](references/brand.md)
- [references/product.md](references/product.md)

### 3. Interpret the user's verb

If the user explicitly uses a mode word like `shape`, `craft`, `critique`, `audit`, or `polish`, read [references/modes.md](references/modes.md) and follow that mode.

If no explicit mode appears, infer one from the request:

- "Design", "redesign", "improve", "make this better" usually means `craft` or `polish`.
- "Review", "what's wrong", "be brutal" means `critique`.
- "Check accessibility", "check responsive", "why is this janky" means `audit`.
- "Make it bolder", "tone it down", "simplify it" maps to the corresponding refinement mode.

### 4. Commit before editing

Before you touch UI code, write down the core decisions in your working notes:

- one sentence describing the physical scene that forces the light/dark choice
- the register
- the color strategy: `Restrained`, `Committed`, `Full palette`, or `Drenched`
- the two or three biggest visual or UX moves

Do not drift into implementation without those decisions. Bland output usually starts there.

### 5. Implement, do not just advise

When the user is asking for execution, change the code. Do not stop at abstract design suggestions unless the user asked only for review or planning.

When the request is critique-only, give findings first, ordered by severity, with concrete fixes.

## Shared Design Laws

Apply these on every frontend task, regardless of register.

### Color

- Use OKLCH when you are choosing new colors or normalizing a palette.
- Never default to pure `#000000` or `#ffffff`. Tint neutrals toward the brand hue.
- Pick a color strategy before picking individual colors.
- Do not collapse every design to one tiny accent color by reflex. That is only valid for `Restrained`.

### Theme

Dark or light is a consequence of the scene, not a default. Write a one-sentence real-world scene first. If the sentence does not force the answer, it is too vague.

### Typography

- Keep reading measure around `65-75ch` for prose.
- Build hierarchy with noticeable scale and weight contrast.
- Avoid flat, timid type scales.

### Layout

- Vary spacing for rhythm.
- Do not reach for cards automatically.
- Nested cards are a design smell.
- Do not wrap everything in a generic centered container.

### Motion

- Animate transform, opacity, filter, and grid transitions, not layout-heavy properties.
- Use easing that settles cleanly. Avoid bounce and elastic motion unless the interface truly demands it.

### Absolute bans

Rewrite the element instead of shipping any of these:

- thick side-accent borders on cards, alerts, or list items
- gradient text for meaningful content
- glassmorphism as a default visual style
- the clichéd hero-metric SaaS block
- endless identical card grids
- modal-first design when inline or progressive disclosure would work better

### Copy

- Every word earns its place.
- Do not restate headings in the first sentence below them.
- Do not use em dashes in UX copy.

## Output Standards

- Match implementation complexity to the aesthetic ambition.
- Vary solutions across projects. Do not converge on the same safe layout and font choices.
- Preserve an existing strong visual system when the product already has one.
- If an interface still looks obviously AI-generated after the change, keep pushing.

## References

- Use [references/brand.md](references/brand.md) for marketing and editorial surfaces.
- Use [references/product.md](references/product.md) for task-focused application UI.
- Use [references/modes.md](references/modes.md) when the user signals a specific design action.
