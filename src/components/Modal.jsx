import { useState } from 'react'
import { submitRegistration } from '../lib/registrations.js'

// Bottom-sheet modal that submits a form through the Worker and shows a
// success state. The email is NOT collected here — the Worker stamps each
// submission with the signed-in family's verified account email.
export default function Modal({
  regType, regLabel, accountEmail,
  title, intro, note, submitLabel, submitClass, success, onClose, children,
}) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries())
    try {
      await submitRegistration({ type: regType, title: regLabel, fields })
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-handle" />
        {submitted ? (
          <div className="success-msg">
            <div className="emoji">{success.emoji}</div>
            <h3>{success.title}</h3>
            <p>{success.body}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>{title}</h2>
            {note && <div className="waitlist-note">{note}</div>}
            {intro && <p>{intro}</p>}
            {children}
            {accountEmail && (
              <p className="account-note">Signing up as <strong>{accountEmail}</strong></p>
            )}
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className={'btn ' + (submitClass || 'btn-black')} disabled={busy}>
              {busy ? 'Submitting…' : submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
