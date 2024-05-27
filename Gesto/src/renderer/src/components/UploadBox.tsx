import { useState, useRef } from 'react'
import FileInfo from './FileInfo'

interface UploadBoxProps {
  setFile: (file: File) => void
}

function UploadBox({ setFile }: UploadBoxProps): JSX.Element {
  const [isActive, setActive] = useState(false)
  const [uploadedInfo, setUploadedInfo] = useState<{
    name: string
    mbSize: string
    type: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) // 파일 입력 요소에 접근하기 위한 ref

  const setFileInfo = (file: File) => {
    const { name, size: byteSize, type } = file
    const mbSize = (byteSize / (1024 * 1024)).toFixed(2) + 'mb'
    setUploadedInfo({ name, mbSize, type }) // name, size, type 정보를 uploadedInfo에 저장
  }

  const handleUpload = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0]
    if (file) {
      setFile(file)
      setFileInfo(file)
    }
  }

  const handleDrag = (bool: boolean) => setActive(bool)
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setActive(false)

    const file = event.dataTransfer.files[0]
    setFile(file)
    setFileInfo(file)
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <>
      <div
        className={`preview${isActive ? ' active' : ''}`}
        onDragEnter={() => handleDrag(true)}
        onDragLeave={() => handleDrag(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      ></div>
      {uploadedInfo ? (
        <FileInfo uploadedInfo={uploadedInfo} />
      ) : (
        <>
          <div className="main-box">
            <input
              type="file"
              className="file-box"
              onChange={handleUpload}
              ref={fileInputRef} // ref를 파일 입력 요소에 연결
              style={{ display: 'none' }} // 기본 파일 입력 요소 숨기기
            />
            <div className="file-msg-box">
              <p className="preview_msg">발표할 PDF 파일을</p>
              <p className="preview_msg">여기에 끌어다 놓으세요</p>
            </div>
            <button className="file-select-btn" onClick={handleClick}>
              Finder에서 선택
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default UploadBox
