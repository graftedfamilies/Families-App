import logo from '../../logo-white.png'

// Shared centered panel used by every auth screen (matches the app's look).
export default function AuthShell({ title, children }) {
  return (
    <div className="signin">
      <div className="signin-card">
        <img className="signin-logo" src={logo} alt="Grafted Families" />
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  )
}
