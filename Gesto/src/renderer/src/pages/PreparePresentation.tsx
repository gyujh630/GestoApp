import { useCallback, useEffect, useRef, useState } from 'react'
import useStore from '@renderer/store/store'
import { useNavigate } from 'react-router-dom'

function PreparePresentation(): JSX.Element {
  const selectedPdf = useStore((state) => state.selectedPdf)
  const selectedPdfList = useStore((state) => state.selectedPdfList)
  const setSelectedPdfList = useStore((state) => state.setSelectedPdfList)

  // const [imageList,setImageList] = useState([]);
  const [selectedPage, setSelectedPage] = useState(0)

  const navigate = useNavigate()

  const renderEachPage = useCallback(
    async (pdf = selectedPdf) => {
      if (pdf) {
        const imagesList: Array<string> = []
        const canvas = document.createElement('canvas')
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 1 })
          canvas.height = viewport.height
          canvas.width = viewport.width
          const render_context = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
          }
          await page.render(render_context).promise
          const img = canvas.toDataURL('image/png')
          imagesList.push(img)
        }
        setSelectedPdfList(imagesList)
      }
    },
    [selectedPdf]
  )
  useEffect(() => {
    renderEachPage(selectedPdf)
  }, [selectedPdf])
  return (
    <>
      <div className="presentation_left">
        {selectedPdfList &&
          selectedPdfList.map((url, index) => (
            <>
              <div>
                <div onClick={() => setSelectedPage(index)} key={`Page ${index + 1}`}>
                  <div className="left-img-box">
                    <img className="img-pages" src={url} alt={`Page ${index + 1}`} />
                  </div>
                </div>
                <div className="page-index">{index + 1}</div>
              </div>
            </>
          ))}
      </div>
      <div className="presentation_right">
        <div onClick={() => navigate('/Presentation')}>
          <img id="img-selected" src={selectedPdfList[selectedPage]} />
        </div>
      </div>
    </>
  )
}

export default PreparePresentation
