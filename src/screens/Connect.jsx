import { groups } from '../data/content.js'

export default function Connect({ onOpenModal }) {
  return (
    <div>
      <div className="hero-card">
        <h2>You don't have to do this alone.</h2>
        <p>Empowered Family Connection Groups bring together foster, adoptive, and kinship parents in trauma-informed, attachment-based community.</p>
      </div>
      <div className="eyebrow">Group Types</div>
      <div className="card-grid">
        {groups.map((g, i) => (
          <div key={i} className="group-card">
            <h3>{g.title}</h3>
            <p>{g.desc}</p>
            {g.locations && (
              <div className="group-locations">
                {g.locations.map((loc) => <span key={loc} className="loc-tag">{loc}</span>)}
              </div>
            )}
            {g.action === 'join' ? (
              <button className="btn btn-black" onClick={() => onOpenModal('connect')}>Join This Group</button>
            ) : (
              <button className="btn btn-outline" onClick={() => window.open(g.link, '_blank')}>Learn More</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
