import { useCallback, useEffect, useRef, useState } from "react";
import useStore from "@renderer/store/store";
import { useNavigate } from "react-router-dom";


function PreparePresentation(): JSX.Element {

    const selectedPdf = useStore((state) => state.selectedPdf);
    const selectedPdfList = useStore((state) => state.selectedPdfList)
    const setSelectedPdfList = useStore((state) => state.setSelectedPdfList)
    
    // const [imageList,setImageList] = useState([]);
    const [selectedPage,setSelectedPage] = useState(0);

    const navigate = useNavigate();

    const renderEachPage = useCallback(
        async( pdf = selectedPdf) => {
          if(pdf){
            const imagesList = [];
            const canvas = document.createElement("canvas");
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                var viewport = page.getViewport({ scale: 1 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                var render_context = {
                  canvasContext: canvas.getContext("2d"),
                  viewport: viewport,
                };
                await page.render(render_context).promise;
                let img = canvas.toDataURL("image/png");
                imagesList.push(img);
            }    
            setSelectedPdfList(imagesList);


          }
        },
        [selectedPdf]
      );
    useEffect(()=>{
        renderEachPage(selectedPdf)
        
    },[selectedPdf])
  return (
    <>
    <div className="presentation_left ">
        {selectedPdfList&&
        selectedPdfList.map((url, index)=>(
            <div onClick={()=>setSelectedPage(index)}
             key={`Page ${index + 1}`}
             style={{width:'100%',borderColor:'red'}}>
                <img src={url}
          alt={`Page ${index + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}/>
            </div>
        ))}
    </div>
    <div className="presentation_right">
        <div onClick={()=>navigate('/Presentation')} style={{width:'100%'}}>
            <img style={{width:'100%',objectFit:'cover'}} src={selectedPdfList[selectedPage]}/>
        </div>
    </div>
    </>
  )
}

export default PreparePresentation
