import './Header.css'

function Header() {
  return (
    <header className="header">
      <p className="header-title">Rohan Balkondekar</p>
      <div className="header-subtitle-container">
        <p className="header-subtitle">Software Engineer</p>
        <img src="../../public/Peacock.png" alt="Peacock" width="25" height="25" />
      </div>
      <p className="header-description">I Build Scalable, Performant and Cost Effective AI Products for Enterprise</p>
    </header>
  )
}

export default Header