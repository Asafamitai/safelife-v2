# SafeLife — Starter (Claude Code handoff)

This folder is the handoff package from the mockup phase to the build phase.
You'll use it to kick off a real project with **Claude Code**.

## What's in here

- `CLAUDE.md` — the full product + build spec. Claude Code auto-reads this.
- `design-reference.html` — the visual target. The first milestone is
  reproducing this 1:1.

## 1. Install Claude Code (once)

If you don't have it yet:

```bash
npm install -g @anthropic-ai/claude-code
```

Check it works:

```bash
claude --version
```

(If the install command is out of date, see
https://docs.claude.com/en/docs/claude-code/overview — it changes occasionally.)

## 2. Get this folder onto your machine

You're getting this from Cowork. Download/copy the whole `SafeLife-starter/`
folder to somewhere you want the project to live, for example:

```bash
mkdir -p ~/dev/safelife
cp -R /path/to/SafeLife-starter/* ~/dev/safelife/
cd ~/dev/safelife
```

## 3. Start Claude Code in the folder

```bash
cd ~/dev/safelife
claude
```

Claude Code will auto-load `CLAUDE.md` as project context.

## 4. First prompt (paste this verbatim)

> Read `CLAUDE.md` and `design-reference.html` in full. Then execute Milestone
> M1: scaffold a Next.js 15 + TypeScript + Tailwind + shadcn/ui project in the
> current folder, wire the theme tokens from §5, and build the marketing
> landing page so it matches `design-reference.html` pixel-for-pixel on
> desktop. Stop at M1, show me a screenshot, and wait for my approval before
> starting M2.

After it finishes: review, iterate, then paste a similar prompt for M2, M3, etc.

## 5. Good follow-up prompts

- `Run the app and take a screenshot of the landing page at 1440px and 390px widths. Compare to design-reference.html and list any visual deltas.`
- `Add Playwright and write one e2e test: the family user sees a scam-check card and can open the review sheet.`
- `Run a WCAG AA contrast check on the parent home screen and fix any failures.`

## 6. Tips working with Claude Code

- Commit after every milestone. Ask it to: `git commit -m "M1: landing matches design"`.
- If it drifts from the spec, point to the file and section: *"Check §5 —
  category tags should be uppercase 11px pills, not lowercase."*
- Use `/init` in Claude Code if you want it to generate an additional
  project-level `CLAUDE.md` on top of this one (this one focuses on product;
  that one will focus on repo conventions once the code exists).

## 7. When you hit a blocker

Come back to Cowork and paste the error, the file, and what you've tried.
Cowork can search the codebase and help with design decisions without burning
your Claude Code session.
