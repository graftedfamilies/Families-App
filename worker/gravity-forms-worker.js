// ============================================================
// Grafted Families — form submission Worker
//
// The app POSTs a form here with the family's Supabase login token.
// This Worker:
//   1. verifies that token with Supabase (server-side),
//   2. records the submission to the `registrations` table
//      (stamped with the VERIFIED account email + user id),
//   3. best-effort forwards it to Gravity Forms on WordPress.
//
// The account email always comes from the verified token — never from
// anything the browser sends — so a submission can't be faked under
// someone else's identity.
//
// Secrets (wrangler secret put NAME):
//   SUPABASE_SERVICE_ROLE_KEY   Supabase service_role key (server-only!)
//   GF_API_KEY                  Gravity Forms REST API key      (optional)
//   GF_API_SECRET               Gravity Forms REST API secret   (optional)
// Vars (wrangler.toml [vars]):
//   SUPABASE_URL, ALLOWED_ORIGIN, GF_SITE, GF_FORM_MAP
// ============================================================

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(env) })
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, env)

    // 1) Verify the Supabase login token → trusted email + user id
    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Not signed in' }, 401, env)

    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    })
    if (!userRes.ok) return json({ error: 'Invalid or expired session' }, 401, env)
    const user = await userRes.json()
    const email = user?.email
    const userId = user?.id
    if (!email || !userId) return json({ error: 'Invalid session' }, 401, env)

    // 2) Parse the submission
    let body
    try { body = await request.json() } catch { return json({ error: 'Bad request body' }, 400, env) }
    const { type, title, fields = {} } = body || {}
    if (!type || !title) return json({ error: 'Missing type or title' }, 400, env)

    // 3) Record to Supabase (source of truth for "my sign-ups")
    const insert = await fetch(`${env.SUPABASE_URL}/rest/v1/registrations`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ user_id: userId, email, type, title, details: fields }),
    })
    if (!insert.ok) {
      return json({ error: 'Could not save your submission' }, 500, env)
    }

    // 4) Best-effort forward to Gravity Forms (only if configured for this type)
    try {
      const map = env.GF_FORM_MAP ? JSON.parse(env.GF_FORM_MAP) : {}
      const conf = map[type]
      if (conf && env.GF_API_KEY && env.GF_API_SECRET && env.GF_SITE) {
        const gfBody = {}
        // Force the email field to the verified account email.
        if (conf.emailFieldId) gfBody[`input_${conf.emailFieldId}`] = email
        // Map app field names -> Gravity Forms field IDs.
        for (const [name, gfId] of Object.entries(conf.fieldMap || {})) {
          if (fields[name] != null && fields[name] !== '') gfBody[`input_${gfId}`] = fields[name]
        }
        const basic = btoa(`${env.GF_API_KEY}:${env.GF_API_SECRET}`)
        await fetch(`${env.GF_SITE}/wp-json/gf/v2/forms/${conf.formId}/submissions`, {
          method: 'POST',
          headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(gfBody),
        })
        // We deliberately don't fail the request if Gravity Forms is down —
        // Supabase already has the submission.
      }
    } catch {
      // swallow: Gravity Forms forwarding is best-effort
    }

    return json({ ok: true }, 200, env)
  },
}

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function json(obj, status, env) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(env) },
  })
}
