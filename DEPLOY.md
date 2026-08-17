# Deploying to Cloudflare Pages (with automatic nightly sync)

By the end you'll have: the app live on the web, auto-deploying whenever you push
code, plus a nightly job that rebuilds it so new blog posts, podcast episodes, and
events show up on their own.

You need two free accounts: **GitHub** and **Cloudflare**.

---

## 1. Put the code on GitHub

Your project is already a git repo (the repo root is the `grafted_families` folder;
the app itself is in the `grafted-families-app` subfolder — that matters in step 2).

1. On GitHub, click **New repository**, name it e.g. `grafted-families`, leave it empty
   (no README), and create it.
2. In a terminal, from the repo root:

   ```bash
   cd ~/Desktop/grafted_families
   git remote add origin https://github.com/<your-username>/grafted-families.git
   git branch -M main
   git push -u origin main
   ```

Refresh GitHub — your files should be there.

---

## 2. Create the Cloudflare Pages project

1. In the [Cloudflare dashboard](https://dash.cloudflare.com) go to
   **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and pick your `grafted-families` repo.
3. Set the **build settings** (this is the important part because the app is in a subfolder):

   | Setting | Value |
   |---|---|
   | Framework preset | Vite (or None) |
   | **Root directory** | `grafted-families-app` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |

4. Click **Save and Deploy**. Cloudflare runs `npm run build` — which first runs the
   content sync, then builds the site — and publishes it.
5. You'll get a live URL like `https://grafted-families.pages.dev`.

From now on, every `git push` to `main` automatically redeploys.

---

## 3. The nightly rebuild — "the cron job part"

Cloudflare only rebuilds when you push code. Since new episodes/posts/events come from
the website (not from your code), you trigger a rebuild on a schedule. Two pieces: a
**Deploy Hook** (a URL that starts a build) and a **scheduler** that calls it nightly.

### Step A — create the Deploy Hook

In your Pages project: **Settings → Builds & deployments → Deploy hooks → Add deploy hook**.

- Name: `nightly-sync`
- Branch: `main`

Copy the URL it gives you. It looks like
`https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxxxxxxx`.
**Treat it like a password** — anyone with it can trigger a build.

Test it works: paste it into a terminal and run
`curl -X POST "<your-deploy-hook-url>"`. Within a minute a new build should appear in
Cloudflare.

### Step B — call it on a schedule

Pick **one** of these.

#### Option 1 — GitHub Actions (recommended; already set up for you)

There's a workflow file at `.github/workflows/nightly-rebuild.yml`. You only need to
give it the hook URL:

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Name: `CLOUDFLARE_DEPLOY_HOOK`  ·  Value: *(your deploy hook URL)*  → **Add secret**.

Done. It runs every night at **09:00 UTC** and triggers a rebuild. You can also test it
anytime: GitHub → **Actions → Nightly rebuild → Run workflow**.

#### Option 2 — Cloudflare Worker Cron (stays entirely in Cloudflare)

Create a Worker with a scheduled trigger instead:

```js
// worker.js
export default {
  async scheduled(event, env, ctx) {
    await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' })
  },
}
```

```toml
# wrangler.toml
name = "grafted-nightly-sync"
main = "worker.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 9 * * *"]   # 09:00 UTC daily
```

Deploy with `npx wrangler deploy`, then add the hook URL:
`npx wrangler secret put DEPLOY_HOOK_URL` (paste the URL when prompted).

---

## Changing the schedule

The cron expression controls timing (in UTC):

- `0 9 * * *` — every day at 09:00 UTC
- `0 9 * * 1` — Mondays only
- `0 */12 * * *` — every 12 hours

New content usually appears within a day of the org publishing it. That's the tradeoff
of build-time sync — simple and free, at the cost of not being instant.

---

## Recap

| Piece | What it does |
|---|---|
| Cloudflare Pages | Hosts the site; rebuilds on every `git push` |
| `npm run build` | Runs the content sync, then builds |
| Deploy Hook | A URL that starts a build on demand |
| GitHub Action / Worker Cron | Calls the Deploy Hook on a schedule |
