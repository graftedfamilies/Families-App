import logo from '../logo-dark.png'

export default function Landing({ name, onEnter }) {
  return (
    <div className="landing">
      <div className="landing-inner">
        <img className="landing-logo" src={logo} alt="Grafted Families" />
        <div className="welcome-name">Welcome, {name}</div>
        <div className="verse-block">
          <div className="verse-text">
            "Come to Me, all who are weary and heavy-laden, and I will give you rest.
            Take My yoke upon you and learn from Me, for I am gentle and humble in heart,
            and you will find rest for your souls."
          </div>
          <div className="verse-ref">— Matthew 11:28–29</div>
        </div>
        <button className="btn-enter" onClick={onEnter}>Enter →</button>
      </div>
    </div>
  )
}
