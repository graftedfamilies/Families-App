# Grafted Families — App

A mobile-first web app for foster and adoptive families: Learn (podcasts & blog),
Connect (support groups), Be Loved (care & prayer), and Events (with sign-up forms).

Built as a **PWA** (Progressive Web App), so it runs in any browser *and* installs to
a phone's home screen like a native app.

## The stack

- **React** — the UI (what you edit)
- **Vite** — the dev server + build tool (fast preview while you work)
- **Tailwind CSS** — available for new styling; brand colors are pre-set in `tailwind.config.js`
- **vite-plugin-pwa** — makes the app installable on phones
- Designed to deploy on **Cloudflare Pages**

## Run it on your computer

You need [Node.js](https://nodejs.org) (LTS version) installed. Then, in this folder:

```bash
npm install      # one time — downloads dependencies
npm run dev      # start the app; opens at http://localhost:5173
```

Edit any file in `src/` and the browser updates instantly.

```bash
npm run build    # make the production version (into the dist/ folder)
npm run preview  # preview that production build locally
```

## Where things live

```
src/
  App.jsx              Main app: sign-in flow, tabs, modals, player
  main.jsx             Entry point
  index.css            All styling (ported from the prototype)
  data/content.js      Events, podcasts, blogs, groups  ← edit content here
  components/          Reusable pieces (header, nav, modal)
  screens/             One file per screen (Learn, Connect, BeLoved, Events, ...)
public/
  icons/               App icons (replace with the real logo)
  _redirects           Tells Cloudflare to serve the app for every URL
```

**To change events, podcasts, or groups,** edit `src/data/content.js` — no other file
needs to change.

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick the repo and use these build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. Every push to GitHub redeploys automatically.

The `public/_redirects` file is already set up so links deep into the app don't 404.

## Making it installable / testing the PWA

The PWA (service worker + manifest) is only active in a production build. To test it:

```bash
npm run build && npm run preview
```

Then open the preview URL on a phone (or Chrome desktop) — you'll get an "Install app"
option. Replace the placeholder icons in `public/icons/` with the real logo before launch.

## Next step: save the form data (backend)

Right now the sign-up, prayer, and waitlist forms just show a success message — they
don't store anything yet. Search the code for `TODO` to find the spots to wire up:

- `src/components/Modal.jsx` — where a submitted form should be saved
- `src/screens/SignIn.jsx` — where real login would go

The recommended backend is **[Supabase](https://supabase.com)** (free tier): it gives you
a database, sign-in, and a simple way to save form submissions. When you add it, only
those `TODO` spots change — the screens stay the same.

## Keeping the Learn feed in sync (automatic)

The podcasts and blog posts on the **Learn** tab are pulled from the organization's
website, so you don't have to update them by hand.

- `scripts/sync-content.js` fetches two RSS feeds — `helponechild.org/feed/` (blog)
  and `helponechild.org/podcast/feed/` (podcast, including each episode's Spotify link) —
  and regenerates `src/data/learn.js`.
- It runs automatically before every build: `npm run build` runs the sync first, then
  builds the app. You can also run it on its own with `npm run sync`.
- If the feeds can't be reached, the build keeps the last generated `src/data/learn.js`,
  so a network hiccup never breaks a deploy.

`src/data/learn.js` is auto-generated — don't edit it by hand. Events, connection groups,
and the Be Loved options are *not* in the feeds, so those stay in `src/data/content.js`.

The **Events** tab is synced the same way: the script pulls upcoming events from The Events Calendar API (`/wp-json/tribe/events/v1/events`), filters out anything before today, and writes `src/data/events.js`. Connection groups and Be Loved options aren't in any feed, so those stay hand-maintained in `src/data/content.js`.

### Making it refresh on a schedule

Cloudflare Pages only rebuilds when you push code, so to pick up new posts automatically
you set up a **scheduled rebuild**:

1. In Cloudflare Pages → your project → **Settings → Builds & deployments**, create a
   **Deploy hook** (this gives you a URL that triggers a fresh build).
2. Use any free scheduler to call that URL on a schedule — e.g. Cloudflare **Cron Triggers**,
   or a GitHub Actions scheduled workflow — say once a night.

Each scheduled build re-runs the sync, so new episodes and posts appear on their own,
typically within a day of being published.

## Accounts & login

Sign up, email confirmation, password reset, and two-factor auth run on Supabase. See **AUTH_SETUP.md** for the one-time setup (create a project, add keys to `.env`, enable options).
