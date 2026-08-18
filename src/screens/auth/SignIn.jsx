import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AuthShell from './AuthShell.jsx'

export default function SignIn({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
    // On success the auth listener re-routes (to 2FA or into the app).
  }

  return (
    <AuthShell title="Sign in to continue">
      <form onSubmit={submit}>
        {error && <div className="auth-error">{error}</div>}
        <div className="signin-field"><input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
        <div className="signin-field"><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
        <button type="submit" className="btn-signin" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <div className="auth-links">
        <button className="link-btn" onClick={() => onNavigate('forgot')}>Forgot password?</button>
        <span className="auth-muted">Don't have an account? <button className="link-btn" onClick={() => onNavigate('signup')}>Sign up</button></span>
      </div>
    </AuthShell>
  )
}
