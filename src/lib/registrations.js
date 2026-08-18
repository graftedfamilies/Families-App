import { supabase } from './supabase.js'

const WORKER_URL = import.meta.env.VITE_WORKER_URL

// Submit a form. We send the Supabase access token (not a typed email);
// the Worker verifies it and stamps the submission with the account email.
export async function submitRegistration({ type, title, fields }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Please sign in first.')
  if (!WORKER_URL) throw new Error('Submissions are not configured yet (missing VITE_WORKER_URL).')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ type, title, fields }),
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || 'Something went wrong submitting the form. Please try again.')
  }
  return res.json().catch(() => ({}))
}

// Read this user's own registrations (row-level security returns only theirs).
export async function getMyRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('id, type, title, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const REG_LABELS = {
  connect: 'Connection Group',
  prayer: 'Prayer Request',
  pno: "Parents' Night Out",
  camp: 'Family Camp',
}
