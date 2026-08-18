import { useState } from 'react'
import { learnItems } from '../data/learn.js'
import { learnFilters } from '../data/content.js'

export default function Learn() {
  const [filter, setFilter] = useState('all')

  const visible = learnItems.filter((item) => filter === 'all' || item.type === filter)

  return (
    <div>
      <div className="section-header">
        <h2>Learn</h2>
        <p>Podcasts, blogs &amp; parenting resources</p>
      </div>
      <div className="filters">
        {learnFilters.map((f) => (
          <div key={f.id} className={'chip' + (filter === f.id ? ' active' : '')} onClick={() => setFilter(f.id)}>
            {f.label}
          </div>
        ))}
      </div>
      <div className="card-grid">
        {visible.map((item, i) => (
          <div key={i} className="card" onClick={() => window.open(item.link, '_blank')}>
            <div className="card-body">
              <span className={'card-badge ' + (item.type === 'podcast' ? 'badge-podcast' : 'badge-blog')}>
                {item.type === 'podcast' ? 'Podcast' : 'Blog'}
              </span>
              <h3>{item.title}</h3>
              <p>{item.blurb}</p>
              <div className="card-meta">{item.date}</div>
            </div>
            <div className="card-footer">
              <span>{item.type === 'podcast' ? 'Listen on Spotify' : 'Read article'}</span>
              <span>{item.type === 'podcast' ? '▶' : '→'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
