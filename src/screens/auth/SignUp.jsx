import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AuthShell from './AuthShell.jsx'

export default function SignUp({ onNavigate }) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName }, emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <p className="auth-note">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.</p>
        <button className="btn-signin" onClick={() => onNavigate('signin')}>Back to sign in</button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account">
      <form onSubmit={submit}>
        {error && <div className="auth-error">{error}</div>}
        <div className="signin-field"><input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" /></div>
        <div className="signin-field"><input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        <div className="signin-field"><input type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /></div>
        <button type="submit" className="btn-signin" disabled={busy}>{busy ? 'Creating…' : 'Sign Up'}</button>
      </form>
      <div className="auth-links">
        <span className="auth-muted">Already have an account? <button className="link-btn" onClick={() => onNavigate('signin')}>Sign in</button></span>
      </div>
    </AuthShell>
  )
}
