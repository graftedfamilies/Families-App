import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AuthShell from './AuthShell.jsx'

// Shown when the user arrives from the "reset password" email link.
export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(error.message)
    else onDone()
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={submit}>
        {error && <div className="auth-error">{error}</div>}
        <div className="signin-field"><input type="password" placeholder="New password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></div>
        <button type="submit" className="btn-signin" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </AuthShell>
  )
}
