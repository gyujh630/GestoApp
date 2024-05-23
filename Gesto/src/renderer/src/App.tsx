import { Link } from 'react-router-dom'
import iconImage from './assets/img/blue-logo.png'

function App(): JSX.Element {

  return (
    <>
      <div className="page-box">
        <div id="slogan-box">
          <img id="home-logo" src={iconImage} alt="" />
          <div id="text-box">
              <span className="slogan-blue">Gesture</span>
              <span className="slogan">to Your Presentation!</span>
          </div>
        </div>
        <div className="actions">
          <div className="action">
            <Link to="/RenderPdf">Start Gesto</Link>
          </div>
        </div>
        <div id="guide-box">
          <span className="guide-txt">처음 사용하시나요?</span>
          <Link to="/guide" className="link-guide">
            <span className="guide-txt-blue">사용 가이드 보기</span>
          </Link>
        </div>
      </div>
    </>
  )
}

export default App
