import { useCallback, useEffect, useState } from 'react'
import useStore from '@renderer/store/store'
import { useNavigate } from 'react-router-dom'
import { SyncLoader } from 'react-spinners'

function PreparePresentation(): JSX.Element {
  const selectedPdf = useStore((state) => state.selectedPdf)
  const selectedPdfList = useStore((state) => state.selectedPdfList)
  const setSelectedPdfList = useStore((state) => state.setSelectedPdfList)

  const [selectedPage, setSelectedPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  const renderEachPage = useCallback(
    async (pdf = selectedPdf) => {
      if (pdf) {
        const imagesList: Array<string> = []
        const canvas = document.createElement('canvas')
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2.5 })
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
        setLoading(false) // 로딩 완료
      }
    },
    [selectedPdf, setSelectedPdfList]
  )

  useEffect(() => {
    renderEachPage(selectedPdf)
  }, [selectedPdf, renderEachPage])

  if (loading) {
    return (
      <div className="load-box">
        <SyncLoader color={'#3071F2'} loading={loading} size={20} />
        <span className="load-txt">파일을 변환하고 있어요!</span>
      </div>
    )
  }

  return (
    loading?
    <div className="load-box">
        <SyncLoader color={'#3071F2'} loading={loading} size={20} />
        <span className="load-txt">파일을 변환하고 있어요!</span>
      </div>
    
    :
    <>
     <div className="presentation_left">
        {selectedPdfList &&
          selectedPdfList.map((url, index) => (
            <div key={`Page ${index + 1}`}>
              <div onClick={() => setSelectedPage(index)}>
                <div className={index==selectedPage?"left-img-box active":"left-img-box"}>
                  <img className="img-pages" src={url} alt={`Page ${index + 1}`} />
                </div>
              </div>
              <div className="page-index">{index + 1}</div>
            </div>
          ))}
      </div>
      <div className="presentation_right">
        <div onClick={() => navigate('/Presentation')}>
          <img
            id="img-selected"
            src={selectedPdfList[selectedPage]}
            alt={`Selected Page ${selectedPage + 1}`}
          />
        </div>
      </div>
      </>

    
  )
}

export default PreparePresentation
