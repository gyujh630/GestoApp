import UploadBox from '@renderer/components/UploadBox'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { settingPdf } from '@renderer/assets/util'
import { useNavigate } from 'react-router-dom'
import useStore from '@renderer/store/store'

function RenderPdf(): JSX.Element {
  //pdfjs를 통해 변환된 pdf proxy객체를 위한 상태
  const selectedPdf = useStore((state) => state.selectedPdf)
  const setSelectedPdf = useStore((state) => state.setSelectedPdf)
  const [pdfRef, setPdfRef] = useState(null)
  //실제 파일을 위한 상태
  const [file, setFile] = useState(null)

  const navigate = useNavigate()

  //node_module의 worker를 인식하지 못해서 cdn. module 경로 잡히면 수정
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.mjs`

  //file upload 형식으로 올린 pdf파일로 로컬 임시 url형식을 생성하여 pdfjsLib,getDocument 파라미터로 사용
  const setGlobalPdf = useCallback((file) => {
    settingPdf(URL.createObjectURL(file), setSelectedPdf)
  }, [])
  useEffect(() => {
    if (file) {
      setGlobalPdf(file)
      navigate('/PreparePresentation',{ state: { new: true } })
    }
  }, [file])

  return (
    <>
      <div className="pdf-page-box">
        {/* <div>{file ? file.name : '선택된 pdf가 없습니다.'}</div> */}
        <UploadBox setFile={setFile}></UploadBox>
      </div>
    </>
  )
}

export default RenderPdf
