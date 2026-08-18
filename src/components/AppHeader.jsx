import logo from '../logo-white.png'

const TABS = [
  { id: 'learn', label: 'Learn' },
  { id: 'connect', label: 'Connect' },
  { id: 'beloved', label: 'Be Loved' },
  { id: 'events', label: 'Events' },
]

export default function AppHeader({ active, onChange, onSignOut }) {
  return (
    <header className="app-header">
      <img className="app-logo" src={logo} alt="Grafted Families" />
      <div className="header-right">
        {/* Tabs show here on laptop; on phones the bottom nav is used instead */}
        <nav className="desktop-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={'top-nav-item' + (active === t.id ? ' active' : '')}
              onClick={() => onChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {onSignOut && <button className="header-signout" onClick={onSignOut}>Sign out</button>}
      </div>
    </header>
  )
}
