# Auth setup (Supabase)

The app uses [Supabase](https://supabase.com) for accounts: sign up with email
confirmation, sign in, forgot/reset password, and two-factor auth (2FA) with an
authenticator app. This is a one-time setup.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Give it a name (e.g. `grafted-families`), set a database password (save it), pick a region, create.
3. Wait ~1 minute for it to provision.

## 2. Add your keys to the app

1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the app folder, copy `.env.example` to `.env` and fill them in:

   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://YOUR-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart `npm run dev` so it picks up the new values.

> `.env` is git-ignored — never commit it. For the live site, add these same two
> variables in **Cloudflare Pages → Settings → Environment variables** (and redeploy).

## 3. Turn on the pieces you need

In the Supabase dashboard:

- **Email confirmation** — **Authentication → Providers → Email**: make sure
  *"Confirm email"* is ON (it's on by default). New users must click the link before signing in.
- **Redirect URLs** — **Authentication → URL Configuration**: set **Site URL** to your
  live site (e.g. `https://grafted-families.pages.dev`) and add these to **Redirect URLs**:
  - `http://localhost:5173` (for local development)
  - your live site URL
  These are where the confirmation and password-reset links send people back to.
- **Two-factor (TOTP)** — **Authentication → Multi-Factor Auth**: make sure the
  **Authenticator app (TOTP)** option is enabled (default). Nothing else to configure —
  the app handles the QR-code enrollment and the code check at login.

## 4. Email sending (for real use)

Supabase's built-in email works for testing but is rate-limited. Before launch, set up
**custom SMTP** (Authentication → Emails → SMTP settings) with a provider like Resend,
SendGrid, or Postmark so confirmation and reset emails deliver reliably.

## How the flows work in the app

- **Sign up** → account created → confirmation email sent → user clicks link → can sign in.
- **Forgot password** → reset email → user clicks link → returns to the app on the
  "Set a new password" screen.
- **2FA** → after first sign-in the app offers to set up an authenticator app (or skip).
  Once enabled, every later sign-in asks for the 6-digit code.

If keys are missing the app still loads (you'll see a console warning), but auth actions
won't work until `.env` is filled in.
