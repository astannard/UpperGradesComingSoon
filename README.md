# UpperGrades — coming soon page

A single self-contained `index.html` (vanilla HTML/CSS/JS, no build step,
no dependencies). Split out into its own public repo so it can be hosted
on GitHub Pages without making the main UpperGrades codebase (a separate,
private repo) public — GitHub Pages on the free/Pro plan requires the
repo it's served from to be public.

Modeled on a reference landing page's layout (announcement bar → split
hero with a checklist + email capture on one side and a product preview
with floating stat badges on the other → a 4-card benefits grid with a
repeated call-to-action). The reference's further sections (pricing plans,
student testimonials, an FAQ) were left out on purpose — those don't
really make sense yet for a page with no live product, no real pricing,
and no students to quote. Easy to add later once there's real content for
them.

## Before this collects any real emails

The form posts to [Formspree](https://formspree.io) — free, no backend
needed. Right now it points at a placeholder:

1. Create a free Formspree account, add a new form.
2. Copy its endpoint ID from the URL Formspree gives you
   (`https://formspree.io/f/XXXXXXX` — the `XXXXXXX` part).
3. In `index.html`, find `FORMSPREE_FORM_ID` (in the `<form>` tag's
   `data-endpoint` attribute) and replace it with that real ID.

Until you do that, the form will submit but fail (Formspree will 404 on
the placeholder endpoint) — the page handles that gracefully (shows the
"something went wrong" message) rather than erroring visibly, but no
emails will actually be captured.

## Publishing it

Since this whole repo is just the one static page, GitHub's plain
"deploy from a branch" Pages option works directly — no custom Actions
workflow needed. **One-time setup**: repo **Settings → Pages → Build and
deployment → Source → "Deploy from a branch"**, then pick **`main`** and
**`/ (root)`**. After that, every push to `main` deploys automatically.

## Editing it

It's one file on purpose — open `index.html`, edit the copy/colours/HTML
directly. No `npm install`, no dev server; open it directly in a browser
to preview (`open index.html` on macOS).
