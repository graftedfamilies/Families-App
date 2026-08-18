import { useEffect, useState } from 'react'
import { getMyRegistrations, REG_LABELS } from '../lib/registrations.js'

// Shows what the signed-in family has signed up for. Renders nothing if
// there's nothing yet (or if the backend isn't configured).
export default function MyRegistrations() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let active = true
    getMyRegistrations()
      .then((rows) => { if (active) setItems(rows) })
      .catch(() => { if (active) setItems([]) })
    return () => { active = false }
  }, [])

  if (!items || items.length === 0) return null

  return (
    <div className="my-regs">
      <div className="my-regs-title">Your sign-ups</div>
      {items.map((r) => (
        <div key={r.id} className="my-reg">
          <span className="my-reg-title">{r.title}</span>
          <span className="my-reg-type">{REG_LABELS[r.type] || r.type}</span>
        </div>
      ))}
    </div>
  )
}
