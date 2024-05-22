import { Link } from 'react-router-dom'

function NavBar(): JSX.Element {
  return (
    <>
      <div className="topBar">
        <Link to="/" className="homeBtn">
          홈
        </Link>
        <Link to="/help" className="homeBtn">
          ?
        </Link>
        <Link to="/setting" className="homeBtn">
          설정
        </Link>
      </div>
    </>
  )
}

export default NavBar
