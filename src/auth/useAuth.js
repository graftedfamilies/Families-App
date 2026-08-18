import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

// Central auth state for the app.
//  - session:  the logged-in user (or null)
//  - aal:      { currentLevel, nextLevel } from Supabase MFA. If a user has a
//              TOTP factor, nextLevel is 'aal2'; they're only fully verified
//              once currentLevel is also 'aal2'.
//  - recovery: true while the user is in a password-reset flow (from the email link)
export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [aal, setAal] = useState(null)
  const [recovery, setRecovery] = useState(false)

  const refreshAal = useCallback(async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setAal(data ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await refreshAal()
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      await refreshAal()
    })
    return () => sub.subscription.unsubscribe()
  }, [refreshAal])

  return { loading, session, aal, recovery, setRecovery, refreshAal }
}
