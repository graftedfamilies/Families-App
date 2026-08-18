import { events } from '../data/events.js'
import MyRegistrations from '../components/MyRegistrations.jsx'

export default function Events({ onOpenModal }) {
  return (
    <div>
      <div className="section-header">
        <h2>Events</h2>
        <p>Upcoming opportunities for your family</p>
      </div>

      <MyRegistrations />

      {events.map((group) => (
        <div key={group.month}>
          <div className="event-month-header">{group.month}</div>
          <div className="card-grid">
            {group.items.map((ev, i) => (
              <div
                key={i}
                className="event-card"
                onClick={() => (ev.modal ? onOpenModal(ev.modal) : window.open(ev.link, '_blank'))}
              >
                <div className="event-row">
                  <div className={'event-date-col' + (ev.accent ? ' accent' : '')}>
                    <div className="month">{ev.mon}</div>
                    <div className="day">{ev.day}</div>
                    <div className="dow">{ev.dow}</div>
                  </div>
                  <div className="event-body">
                    <span className={'event-cat ' + ev.catClass}>{ev.cat}</span>
                    <h3>{ev.title}</h3>
                    <div className="event-meta-row">{ev.meta}</div>
                    {ev.free && <span className="event-free">Free</span>}
                    {ev.waitlist && <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700 }}>WAITLIST OPEN</span>}
                  </div>
                </div>
                <div className="event-signup" style={ev.accent ? { color: 'var(--accent)' } : undefined}>{ev.cta}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="calendar-link">
        <a href="https://helponechild.org/events/" target="_blank" rel="noreferrer">View full calendar at helponechild.org →</a>
      </div>
    </div>
  )
}
