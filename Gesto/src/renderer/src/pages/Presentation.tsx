import { useCallback, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import useStore from "@renderer/store/store";
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { getGesture, getPointer, getZoomPointer, getZoomDistance } from '../assets/gestureUtil' 
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
};


function Presentation(): JSX.Element {
  //선택된 pdf파일
  const selectedPdf = useStore((state) => state.selectedPdf);
  const selectedPdfList = useStore((state) => state.selectedPdfList);

  const slideRef = Array.from({ length: selectedPdfList.length }).map(() => useRef());
  const gestureRef = useRef(null);
  const videoRef = useRef(null);

  const [windowSize,setWindowSize] = useState({width:window.innerWidth,height:window.innerHeight});

  function simulateMouseEvent( eventName,x?,y?) {
    // 터치 이벤트 객체 생성
    const event = new MouseEvent(eventName, {
      bubbles: true,
      cancelable: true,
      clientX: x&& x,
      clientY: y&& y
    });
    // 터치 이벤트 전송
    return(event)
  }

  const handleWindowSize = () => {
    setWindowSize({width:window.innerWidth,height:window.innerHeight})
  }

  //pdf그리기
  const renderPage = useCallback(
    async (pageNum, pdf = selectedPdf) => {
      if(pdf){
        await pdf.getPage(pageNum).then(function (page) {

          const viewport = page.getViewport({ scale: 1 });
          console.log('page의 viewport프로퍼티: ',viewport)
          const canvas = canvasRef.current;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
          };
          page.render(renderContext);
        });
      }
    },
    [selectedPdf]
  );
  



  useEffect(() => {
    let handLandmarker
    let animationFrameId
    let holding =false;
    window.addEventListener('resize',handleWindowSize)
    
    //handdetection 모델 호출한 후 detecthands()
    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        )
        //can not get handlandMarker
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        })
        detectHands()
      } catch (error) {
        console.error('Error initializing hand detection:', error)
      }
    }
    //받아온 랜드마크정보를 이용하여 손을 그려주는 부분. 이 부분을 커스텀하여 포인터,확대축소 커서등 구현 가능
    const drawLandmarks = (landmarksArray) => {
      const canvas = gestureRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 1
      const gestureNow = getGesture(landmarksArray);
      if (landmarksArray.length != 0) {
        let pointer = {};
         if (gestureNow == "HOLD") {
          pointer = getPointer(landmarksArray, canvas);
          ctx.fillStyle = "green";
          if(holding == false){
            holding = true
            slideRef[0].current.dispatchEvent(simulateMouseEvent('mousedown',pointer.x,pointer.y));
          }
          else{
            slideRef[0].current.dispatchEvent(simulateMouseEvent('mousemove',pointer.x,pointer.y));
          }
        } else {
          if(gestureNow == "POINTER"){
            pointer = getPointer(landmarksArray, canvas);
            ctx.fillStyle = "red";
          }
          else{
            pointer = getZoomPointer(landmarksArray, canvas);
          ctx.fillStyle = "blue";
          }
          holding = false
          slideRef[0].current.dispatchEvent(simulateMouseEvent('mouseup'))
        }
        // 빨간색 점 그리기
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 1, 0, 2 * Math.PI);
        ctx.fill();
        
      }
    }

    //비디오에서 손 감지한 후 drawLandmarks
    const detectHands = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const detections = handLandmarker.detectForVideo(videoRef.current, performance.now())
        // setHandPresence(detections.handednesses.length > 0)

        // Assuming detections.landmarks is an array of landmark objects
        if (detections.landmarks.length>0) {
          const cur_gesture = getGesture(detections.landmarks); // 현재 인식된 제스처
          drawLandmarks(detections.landmarks)
        }
      } 
      //프레임변하면 재귀적으로 호출(반복)
      requestAnimationFrame(detectHands)
    }

    //웹캠 시작시킨후 initial hand detection
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream
        await initializeHandDetection()
      } catch (error) {
        console.error('Error accessing webcam:', error)
      }
    }

    startWebcam();

    // cleanUp function (component unmount시 실행)
    return () => {
      window.removeEventListener('resize',handleWindowSize)
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      }
      if (handLandmarker) {
        handLandmarker.close()
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

    }
  }, [])


  



  return (
    <>
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }}></video>
      <div style={{width:'100%',height:'100%',backgroundColor:'blue'}}>
      <Slider {...settings}>
      {selectedPdfList&&
        selectedPdfList.map((url, index)=>(
            <div
             key={`Page ${index + 1}`}
             style={{width:800,borderColor:'red'}}>
                <img src={url}
                ref={slideRef[index] }
          alt={`Page ${index + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}/>
            </div>
        ))}
      </Slider>
      <canvas ref={gestureRef}
       style={{width:'100%',height:'100%',position: 'absolute',top: 0,left: 0,pointerEvents:'none'}}
       ></canvas>
      </div>

    </>
  )
}

export default Presentation
