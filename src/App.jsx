import { useState } from 'react'
import { supabase } from './lib/supabase.js'
import { useAuth } from './auth/useAuth.js'
import SignIn from './screens/auth/SignIn.jsx'
import SignUp from './screens/auth/SignUp.jsx'
import ForgotPassword from './screens/auth/ForgotPassword.jsx'
import ResetPassword from './screens/auth/ResetPassword.jsx'
import MfaEnroll from './screens/auth/MfaEnroll.jsx'
import MfaChallenge from './screens/auth/MfaChallenge.jsx'
import AppHeader from './components/AppHeader.jsx'
import BottomNav from './components/BottomNav.jsx'
import Modal from './components/Modal.jsx'
import Landing from './screens/Landing.jsx'
import Learn from './screens/Learn.jsx'
import Connect from './screens/Connect.jsx'
import BeLoved from './screens/BeLoved.jsx'
import Events from './screens/Events.jsx'

function Splash({ children }) {
  return (
    <div className="app-shell">
      <div className="signin"><div className="signin-card"><p className="auth-note">{children}</p></div></div>
    </div>
  )
}

export default function App() {
  const { loading, session, aal, recovery, setRecovery, refreshAal } = useAuth()
  const [authView, setAuthView] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [mfaSkipped, setMfaSkipped] = useState(false)
  const [entered, setEntered] = useState(false)
  const [tab, setTab] = useState('learn')
  const [modal, setModal] = useState(null)

  const signOut = () => supabase.auth.signOut()

  if (loading) return <Splash>Loading…</Splash>

  // 1) Password recovery (arrived from the reset email link)
  if (recovery && session) {
    return (
      <div className="app-shell">
        <ResetPassword onDone={() => setRecovery(false)} />
      </div>
    )
  }

  // 2) Not signed in → auth screens
  if (!session) {
    return (
      <div className="app-shell">
        {authView === 'signin' && <SignIn onNavigate={setAuthView} />}
        {authView === 'signup' && <SignUp onNavigate={setAuthView} />}
        {authView === 'forgot' && <ForgotPassword onNavigate={setAuthView} />}
      </div>
    )
  }

  // 3) Signed in, has 2FA, but hasn't verified this session → challenge
  if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
    return (
      <div className="app-shell">
        <MfaChallenge onVerified={refreshAal} onSignOut={signOut} />
      </div>
    )
  }

  // 4) Signed in, no 2FA yet → offer to set it up (can skip)
  if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal1' && !mfaSkipped) {
    return (
      <div className="app-shell">
        <MfaEnroll onDone={refreshAal} onSkip={() => setMfaSkipped(true)} />
      </div>
    )
  }

  // 5) Fully authenticated → welcome screen, then the app
  const name = session.user?.user_metadata?.first_name || 'Friend'
  if (!entered) {
    return (
      <div className="app-shell">
        <Landing name={name} onEnter={() => setEntered(true)} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader active={tab} onChange={setTab} onSignOut={signOut} />
      <main className="content">
        {tab === 'learn' && <Learn />}
        {tab === 'connect' && <Connect onOpenModal={setModal} />}
        {tab === 'beloved' && <BeLoved onOpenModal={setModal} />}
        {tab === 'events' && <Events onOpenModal={setModal} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />

      {modal === 'connect' && (
        <Modal
          regType="connect"
          regLabel="Connection Group"
          accountEmail={session.user?.email}
          title="Join a Connection Group"
          intro="Fill out this form and we'll connect you with the right group."
          submitLabel="Submit"
          success={{ emoji: '🎉', title: "You're on your way!", body: 'A Grafted Families team member will reach out soon about joining a group.' }}
          onClose={() => setModal(null)}
        >
          <label className="form-label">First Name</label>
          <input className="form-input" name="first_name" type="text" placeholder="First name" />
          <label className="form-label">Last Name</label>
          <input className="form-input" name="last_name" type="text" placeholder="Last name" />
          <label className="form-label">Location</label>
          <select className="form-select" name="location">
            <option>Berkeley</option><option>Livermore</option><option>Los Altos</option>
            <option>Los Gatos</option><option>Palo Alto</option><option>Redwood City</option>
            <option>San Jose</option><option>San Francisco</option><option>Santa Rosa</option><option>Virtual</option>
          </select>
        </Modal>
      )}

      {modal === 'prayer' && (
        <Modal
          regType="prayer"
          regLabel="Prayer Request"
          accountEmail={session.user?.email}
          title="🙏 Prayer Request"
          intro="Share what's on your heart. Our community will pray for you."
          submitLabel="Submit Request"
          success={{ emoji: '❤️', title: "We're praying for you.", body: 'You are not alone — our community stands with you.' }}
          onClose={() => setModal(null)}
        >
          <label className="form-label">Your Name</label>
          <input className="form-input" name="name" type="text" placeholder="First name or anonymous" />
          <label className="form-label">Your Prayer Request</label>
          <textarea className="form-textarea" name="request" style={{ height: 100 }} placeholder="Share what you'd like prayer for..." />
        </Modal>
      )}

      {modal === 'pno' && (
        <Modal
          regType="pno"
          regLabel="Parents' Night Out"
          accountEmail={session.user?.email}
          title="🎉 Parents' Night Out"
          intro="Sign up for a free evening of respite. Your kids will have a wonderful time!"
          submitLabel="Sign Up"
          success={{ emoji: '🎈', title: "You're signed up!", body: "We'll send confirmation details soon. Enjoy your night!" }}
          onClose={() => setModal(null)}
        >
          <label className="form-label">Parent Name(s)</label>
          <input className="form-input" name="parent_names" type="text" placeholder="Your name(s)" />
          <label className="form-label">Number of Children</label>
          <select className="form-select" name="num_children"><option>1</option><option>2</option><option>3</option><option>4+</option></select>
          <label className="form-label">Ages of Children</label>
          <input className="form-input" name="ages" type="text" placeholder="e.g. 4, 7, 11" />
        </Modal>
      )}

      {modal === 'camp' && (
        <Modal
          regType="camp"
          regLabel="Family Camp Waitlist"
          accountEmail={session.user?.email}
          title="🏕️ Family Camp Waitlist"
          note="⚠️ Registration is currently full. Join the waitlist and we'll contact you if space opens up."
          intro="July 31–August 2 · Redwood Christian Park · $100/person"
          submitLabel="Join Waitlist"
          submitClass="btn-accent"
          success={{ emoji: '🌲', title: "You're on the waitlist!", body: "We'll reach out as soon as space opens up. Hope to see you among the redwoods!" }}
          onClose={() => setModal(null)}
        >
          <label className="form-label">Family Name</label>
          <input className="form-input" name="family_name" type="text" placeholder="Last name" />
          <label className="form-label">Number Attending</label>
          <input className="form-input" name="num_attending" type="number" placeholder="e.g. 4" />
          <label className="form-label">Financial Assistance</label>
          <select className="form-select" name="financial_assistance"><option>No, I can pay full price</option><option>Yes, please send scholarship info</option></select>
        </Modal>
      )}
    </div>
  )
}
