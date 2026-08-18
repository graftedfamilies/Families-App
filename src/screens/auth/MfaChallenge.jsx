import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AuthShell from './AuthShell.jsx'

// Second-factor step at login for users who have TOTP enabled.
export default function MfaChallenge({ onVerified, onSignOut }) {
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === 'verified') || data?.totp?.[0]
      if (totp) setFactorId(totp.id)
    })
  }, [])

  async function verify(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
    setBusy(false)
    if (error) setError(error.message)
    else onVerified()
  }

  return (
    <AuthShell title="Two-factor verification">
      <p className="auth-note">Enter the 6-digit code from your authenticator app.</p>
      <form onSubmit={verify}>
        {error && <div className="auth-error">{error}</div>}
        <div className="signin-field"><input inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required /></div>
        <button type="submit" className="btn-signin" disabled={busy || code.length < 6 || !factorId}>{busy ? 'Verifying…' : 'Verify'}</button>
      </form>
      <div className="auth-links"><button className="link-btn" onClick={onSignOut}>Sign out</button></div>
    </AuthShell>
  )
}
