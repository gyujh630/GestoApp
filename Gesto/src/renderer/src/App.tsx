import { Link } from 'react-router-dom'
import iconImage from './assets/blue-logo.png'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <main id="home">
        <div id="slogan-box">
          <img id="home-logo" src={iconImage} alt="" />
          <div id="text-box">
            <div>
              <span className="slogan-blue">Hand</span>
              <span> </span>
              <span className="slogan">Your</span>
            </div>
            <span className="slogan">Presentation.</span>
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
        <div></div>
      </main>
    </>
  )
}

export default App
