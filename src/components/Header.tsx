import './Header.css'
import SocialLinks from './SocialLinks'

function Header() {
  return (
    <header className="header">
      <p className="header-title">Rohan Balkondekar</p>
      <div className="header-subtitle-container">
        <p className="header-subtitle">AI Software Engineer</p>
        <img src="https://github.com/rohanbalkondekar/rohanbalkondekar.com/blob/master/public/Peacock.png?raw=true" alt="Peacock" width="25" height="25" />

      </div>
      <p className="header-description">✦ I Build Scalable, Performant and Cost Effective AI Products for Enterprise</p>

    <SocialLinks />

    </header>
  )
}

export default Header