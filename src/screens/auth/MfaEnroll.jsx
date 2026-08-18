import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AuthShell from './AuthShell.jsx'

// Enroll a TOTP factor: show a QR code, then verify a 6-digit code.
export default function MfaEnroll({ onDone, onSkip }) {
  const [factorId, setFactorId] = useState('')
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      // Remove any leftover unverified factor from a previous attempt, then enroll fresh.
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const unverified = factors?.all?.filter((f) => f.status === 'unverified') || []
      for (const f of unverified) await supabase.auth.mfa.unenroll({ factorId: f.id })

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (!active) return
      if (error) { setError(error.message); setLoading(false); return }
      setFactorId(data.id)
      setQr(data.totp.qr_code)
      setSecret(data.totp.secret)
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  async function verify(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
    setBusy(false)
    if (error) setError(error.message)
    else onDone()
  }

  return (
    <AuthShell title="Set up two-factor authentication">
      {loading ? (
        <p className="auth-note">Preparing…</p>
      ) : (
        <>
          <p className="auth-note">Scan this QR code with an authenticator app (Google Authenticator, Authy, or 1Password), then enter the 6-digit code it shows.</p>
          {qr && <img className="mfa-qr" src={qr} alt="Authenticator QR code" />}
          {secret && <div className="mfa-secret">Can't scan? Enter this key: {secret}</div>}
          <form onSubmit={verify}>
            {error && <div className="auth-error">{error}</div>}
            <div className="signin-field"><input inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required /></div>
            <button type="submit" className="btn-signin" disabled={busy || code.length < 6}>{busy ? 'Verifying…' : 'Verify & enable'}</button>
          </form>
        </>
      )}
      {onSkip && <div className="auth-links"><button className="link-btn" onClick={onSkip}>Set up later</button></div>}
    </AuthShell>
  )
}
