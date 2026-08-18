import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AuthShell from './AuthShell.jsx'

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <p className="auth-note">If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.</p>
        <button className="btn-signin" onClick={() => onNavigate('signin')}>Back to sign in</button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Reset your password">
      <form onSubmit={submit}>
        {error && <div className="auth-error">{error}</div>}
        <p className="auth-note">Enter your email and we'll send you a link to set a new password.</p>
        <div className="signin-field"><input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        <button type="submit" className="btn-signin" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <div className="auth-links"><button className="link-btn" onClick={() => onNavigate('signin')}>Back to sign in</button></div>
    </AuthShell>
  )
}
