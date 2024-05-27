import { Link } from 'react-router-dom'
import iconHome from '../assets/img/icon-home.png'
import iconHelp from '../assets/img/icon-help.png'
import iconSetting from '../assets/img/icon-setting.png'
import useStore from '../store/store'


function handleClick(): void {
  const setTopBarState = useStore((state) => state.setTopBarState)
  setTopBarState(false)
}


function NavBar(): JSX.Element {
  const { showStartLink } = useStore() // useStore 훅을 사용하여 상태 및 토글 함수를 가져옴

  return (
    <>
      <div className="topBar">
        <div className="topBar-left"></div>
        <div className="topBar-center">
          {/* 상태에 따라 링크를 렌더링 */}
          {showStartLink && (
            <Link to="/Presentation" className="start-btn-contain">
              <div className="ppt-start-btn">시작하기</div>
            </Link>
          )}
        </div>
        <div className="topBar-right">
          <Link to="/" className="topbarBtn" onClick={handleClick}>
            <img className="topbar-icon" src={iconHome} alt="" />
          </Link>
          <Link to="/guide" className="topbarBtn" onClick={handleClick}>
            <img className="topbar-icon" src={iconHelp} alt="" />
          </Link>
          {/* <Link to="/setting" className="topbarBtn" onClick={handleClick}>
            <img className="topbar-icon" src={iconSetting} alt="" />
          </Link> */}
        </div>
      </div>
    </>
  )
}

export default NavBar