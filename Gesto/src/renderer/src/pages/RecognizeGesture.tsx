import { useCallback, useEffect, useRef, useState } from "react";
import useStore from "@renderer/store/store";
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { getGesture, getPointer, getZoomPointer, getZoomDistance } from '../assets/gestureUtil' 

type Gesture = "???" | "HOLD" | "ZOOM" | "POINTER" | "ZOOM_POINTER";

interface Count {
    p_count : number,
    h_count : number,
    z_count : number,
    q_count : number,
    zp_count : number,
}

function RecognizeGesture(): JSX.Element {
  const canvasRef = useRef(null);
  const gestureRef = useRef(null);
  const videoRef = useRef(null);
  const [windowSize,setWindowSize] = useState({width:window.innerWidth,height:window.innerHeight});

  /* ZOOM 관련 변수 */
  const [zoom_rate,setZoomRate] = useState(100);
  const [zoom_start_dist,setZoomStartDist] = useState(0);
  const [zoom_ing,setZooming] = useState(false);
  const [prev_zoom_rate,setPrevZoomRate] = useState(100);

   


  
  const handleWindowSize = () => {
    setWindowSize({width:window.innerWidth,height:window.innerHeight})
  }


  useEffect(() => {
    let handLandmarker
    let animationFrameId
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
      canvas.innerHeight = videoRef.innerHeight;
      canvas.innerWidth = videoRef.innerWidth;

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 1

      landmarksArray.forEach((landmarks) => {
        landmarks.forEach((landmark) => {
          const x = landmark.x * canvas.width
          const y = landmark.y * canvas.height

          ctx.beginPath()
          ctx.arc(x, y, 1, 0, 2 * Math.PI); // Draw a circle for each landmark
          ctx.fillStyle = 'red';
          ctx.fill();
        })
      })
    }

    //비디오에서 손 감지한 후 drawLandmarks
    const detectHands = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = handLandmarker.detectForVideo(videoRef.current, performance.now())
        // setHandPresence(detections.handednesses.length > 0)
        

        // Assuming detections.landmarks is an array of landmark objects
        if (results.landmarks.length > 0) {        
                const cur_gesture = getGesture(results.landmarks); // 현재 인식된 제스처
                console.log("현재 인식된 제스처: ",cur_gesture)
          drawLandmarks(results.landmarks)
          
        }
      }
      //프레임변하면 재귀적으로 호출(반복)
      requestAnimationFrame(detectHands)
    }
    console.log('현재브라우저 정보 : ',navigator.mediaDevices)

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
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'blue'}}></div>
      <canvas ref={gestureRef} ></canvas>
    </>
  )
}

export default RecognizeGesture
