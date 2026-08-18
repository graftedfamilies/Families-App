import { careOptions } from '../data/content.js'

export default function BeLoved({ onOpenModal }) {
  return (
    <div>
      <div className="section-header">
        <h2>Be Loved</h2>
        <p>We're here for you. Let us know how we can help.</p>
      </div>
      <div style={{ height: 8 }} />
      <div className="card-grid">
        {careOptions.map((c, i) => (
          <div
            key={i}
            className="care-card"
            onClick={() => (c.modal ? onOpenModal(c.modal) : window.open(c.link, '_blank'))}
          >
            <div className="care-icon-box">{c.icon}</div>
            <div className="care-text"><h3>{c.title}</h3><p>{c.sub}</p></div>
            <div className="care-arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
