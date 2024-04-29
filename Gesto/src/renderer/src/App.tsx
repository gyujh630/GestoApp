
import { Link } from 'react-router-dom'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="actions">
        <div className="action">
          <Link to="/RenderPdf">pdf test</Link>
        </div>
      </div>
    </>
  )
}

export default App
