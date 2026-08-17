# Setting up the form-submission Worker (Cloudflare)

This Worker receives form submissions from the app, verifies the family's login,
saves each one to Supabase (so the app can show "Your sign-ups"), and forwards it
to Gravity Forms on WordPress. The Worker files are in the `worker/` folder.

You'll do this once. Budget ~30 minutes.

---

## What you need first

- The [`wrangler`](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
  CLI: `npm install -g wrangler`, then `wrangler login`.
- Your Supabase project (from `AUTH_SETUP.md`).
- Admin access to the WordPress site for Gravity Forms.

---

## 1. Create the Supabase table

In Supabase → **SQL Editor**, paste and run the contents of
`supabase/registrations.sql`. This creates the `registrations` table and the
row-level-security rule so each family can only read their own sign-ups.

---

## 2. Get your Supabase service-role key

Supabase → **Project Settings → API → Project API keys** → copy the **`service_role`**
key. This key can bypass security rules, so it lives **only** in the Worker as a secret —
never in the app, never in git.

---

## 3. Enable the Gravity Forms REST API + get keys

In WordPress admin:

1. **Forms → Settings → REST API** → check **Enable access to the API**.
2. **Add key** → Description e.g. "app worker", Permissions **Read/Write** → **Add**.
3. Copy the **Consumer Key** and **Consumer Secret** (shown once).

## 4. Find your form and field IDs

For each form you want submissions to reach (connection group, prayer, PNO, camp):

- **Form ID**: Forms list → hover a form, or open it → the URL shows `id=3`.
- **Field IDs**: open the form editor, click a field → its ID shows in the field settings
  (e.g. the email field might be `5`, first name `1`). Note the email field's ID and the
  ID of each field you want to send.

Build a mapping. The app sends these field **names**:

| App form (`type`) | Field names the app sends |
|---|---|
| `connect` | `first_name`, `last_name`, `location` |
| `prayer` | `name`, `request` |
| `pno` | `parent_names`, `num_children`, `ages` |
| `camp` | `family_name`, `num_attending`, `financial_assistance` |

Map each name to the Gravity Forms field ID, and note the email field ID separately.

---

## 5. Configure `worker/wrangler.toml`

Edit the `[vars]` block:

```toml
SUPABASE_URL   = "https://YOUR-ref.supabase.co"
ALLOWED_ORIGIN = "https://grafted-families.pages.dev"   # your live app URL
GF_SITE        = "https://helponechild.org"

# One entry per form type. emailFieldId = the GF email field; fieldMap = app name -> GF id.
GF_FORM_MAP = '{"connect":{"formId":3,"emailFieldId":5,"fieldMap":{"first_name":1,"last_name":2,"location":6}},"prayer":{"formId":4,"emailFieldId":3,"fieldMap":{"name":1,"request":2}},"pno":{"formId":7,"emailFieldId":4,"fieldMap":{"parent_names":1,"num_children":5,"ages":6}},"camp":{"formId":9,"emailFieldId":4,"fieldMap":{"family_name":1,"num_attending":5,"financial_assistance":6}}}'
```

Replace the IDs with your real ones. (If you leave `GF_FORM_MAP` as `"{}"`, submissions
still save to Supabase — they just won't forward to Gravity Forms yet.)

---

## 6. Set the secrets

From inside the `worker/` folder:

```bash
cd worker
wrangler secret put SUPABASE_SERVICE_ROLE_KEY   # paste the service_role key
wrangler secret put GF_API_KEY                  # Gravity Forms consumer key
wrangler secret put GF_API_SECRET               # Gravity Forms consumer secret
```

---

## 7. Deploy

```bash
wrangler deploy
```

Wrangler prints the Worker URL, e.g. `https://grafted-forms.your-subdomain.workers.dev`.

---

## 8. Point the app at the Worker

- **Local dev**: add to the app's `.env`:
  ```
  VITE_WORKER_URL=https://grafted-forms.your-subdomain.workers.dev
  ```
  Restart `npm run dev`.
- **Live site**: Cloudflare Pages → your project → **Settings → Environment variables** →
  add `VITE_WORKER_URL` with the same value → redeploy.

---

## 9. Test it

1. Sign in to the app, open a form (e.g. Parents' Night Out), submit it.
2. In Supabase → **Table editor → registrations**, you should see a new row with the
   correct `user_id`, `email`, `type`, and the field values in `details`.
3. In Gravity Forms → the form → **Entries**, you should see the entry (if you filled in
   `GF_FORM_MAP`).
4. Back in the app, the **Events** tab shows a "Your sign-ups" list.

---

## How it stays secure

- The account email is read from the **verified Supabase token inside the Worker**, not
  from the form — so nobody can submit under another family's email.
- The `service_role` and Gravity Forms keys live only as Worker **secrets**, never in the
  browser or in git.
- `ALLOWED_ORIGIN` limits which site can call the Worker (set it to your real app URL, not `*`).
- Families can only read their **own** sign-ups, enforced by the row-level-security policy.
