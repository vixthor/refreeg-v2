---
alwaysApply: true
---

🔒 RefreeG Project Rules (Must Follow)

1. Architecture First, Features Second

Do not introduce new patterns unless an existing one clearly fails.

Follow the current Next.js App Router structure.

Server logic stays in API routes / server actions, not client components.

UI components must remain dumb and reusable. Business logic lives elsewhere.

2. TypeScript Is Not Optional

No any, no as unknown as, no type escapes.

All API responses, Supabase queries, and hooks must be typed.

Shared types go in /types, not inline across files.

If it’s hard to type, the design is wrong.

3. Data Fetching Rules

Use TanStack Query for all client-side fetching.

Queries must:

Have stable query keys

Handle loading, error, and empty states

Mutations must:

Invalidate or optimistically update relevant queries

Never rely on manual page refreshes

4. Supabase Discipline

No direct Supabase calls inside UI components.

Supabase access goes through:

lib/supabase/\*

or API routes

RLS rules must be respected. Never bypass security for convenience.

5. UI & Styling Rules

Tailwind only. No inline styles.

Reuse existing UI components before creating new ones.

All interactive elements must have:

Hover states

Disabled states

Accessible labels

If it looks clickable, it must behave clickable.

7. Performance & UX

Avoid unnecessary re-renders.

Memoize heavy components where needed.

No blocking client-side computations.

Skeletons > spinners for dashboard pages.

8. Refactoring Rules

Refactor without changing behavior unless explicitly requested.

Each refactor PR must answer:

What was wrong?

What improved?

One concern per PR. No “while I was here” commits.

9. Git & PR Discipline

Small, focused commits.

Clear commit messages.

PRs must include:

Summary

Screenshots (if UI)

Risks or follow-ups

No direct pushes to main.

10. Golden Rule

If a new developer cannot understand the code in 5 minutes, it’s not done.

Clarity beats cleverness. Always.
