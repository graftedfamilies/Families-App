const TABS = [
  { id: 'learn', label: 'Learn' },
  { id: 'connect', label: 'Connect' },
  { id: 'beloved', label: 'Be Loved' },
  { id: 'events', label: 'Events' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={'nav-item' + (active === tab.id ? ' active' : '')}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
