import { Link } from 'react-router-dom'
import iconHome from '../assets/img/icon-home.png'
import iconHelp from '../assets/img/icon-help.png'
import iconSetting from '../assets/img/icon-setting.png'

function NavBar(): JSX.Element {
  return (
    <>
      <div className="topBar">
        <Link to="/" className="topbarBtn">
          <img className="topbar-icon" src={iconHome} alt="" />
        </Link>
        <Link to="/guide" className="topbarBtn">
          <img className="topbar-icon" src={iconHelp} alt="" />
        </Link>
        <Link to="/setting" className="topbarBtn">
          <img className="topbar-icon" src={iconSetting} alt="" />
        </Link>
      </div>
    </>
  )
}

export default NavBar
