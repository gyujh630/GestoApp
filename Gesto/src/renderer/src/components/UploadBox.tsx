import { useState } from "react";
import FileInfo from "./FileInfo";

function UploadBox ({setFile}): JSX.Element{

  const [isActive, setActive] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState(null);


  const setFileInfo = (file) => {
    const { name, size: byteSize, type } = file;
    const mbSize = (byteSize / (1024 * 1024)).toFixed(2) + 'mb';
    setUploadedInfo({ name, mbSize, type });  // name, size, type 정보를 uploadedInfo에 저장
  };

  const handleUpload = ({ target }) => {
    const file = target.files[0];
    setFile(file);
    setFileInfo(file);  
  };

  const handleDrag = (bool:boolean) => setActive(bool);
  const handleDragOver = (event)=>{
    event.preventDefault();
  }
  const handleDrop = (event) => {
    event.preventDefault();
    setActive(false);

    const file = event.dataTransfer.files[0];
    setFileInfo(file);  
  };

    return (
      <label className={`preview${isActive ? ' active' : ''}`} 
      onDragEnter={()=>handleDrag(true)}  
      onDragLeave={()=>handleDrag(false)}  
      onDragOver={handleDragOver}
      onDrop={handleDrop}>

        {
        uploadedInfo?
        <FileInfo uploadedInfo={uploadedInfo}/>
        :
        <>
        <input type="file" className="file" onChange={handleUpload} />
        <p className="preview_msg">클릭 혹은 파일을 이곳에 드롭하세요.</p>
        <p className="preview_desc">pdf 주세욤</p>
        </>
        }
        
      </label>
    );
  };

  export default UploadBox

  