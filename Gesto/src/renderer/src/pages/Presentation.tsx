import { useCallback, useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";
import useStore from "@renderer/store/store";
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { getGesture, getPointer, getZoomPointer, getZoomDistance, interpolate } from '../assets/gestureUtil' 
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { c } from "vite/dist/node/types.d-aGj9QkWt";

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
}

export interface Coordinate {
  x: number
  y: number
}

function Presentation(): JSX.Element {
  //선택된 pdf파일
  const selectedPdf = useStore((state) => state.selectedPdf)
  const selectedPdfList = useStore((state) => state.selectedPdfList)

  const slideRef = Array.from({ length: selectedPdfList.length }).map(() => useRef())
  const gestureRef = useRef(null)
  const videoRef = useRef(null)

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  function simulateMouseEvent(eventName, x?, y?) {
    // 터치 이벤트 객체 생성
    const event = new MouseEvent(eventName, {
      bubbles: true,
      cancelable: true,
      clientX: x && x,
      clientY: y && y
    })
    // 터치 이벤트 전송
    return event
  }

  const handleWindowSize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }

  //pdf그리기
  const renderPage = useCallback(
    async (pageNum, pdf = selectedPdf) => {
      if (pdf) {
        await pdf.getPage(pageNum).then(function (page) {
          const viewport = page.getViewport({ scale: 1 })
          console.log('page의 viewport프로퍼티: ', viewport)
          const canvas = canvasRef.current
          canvas.height = viewport.height
          canvas.width = viewport.width
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
          }
          page.render(renderContext)
        })
      }
    },
    [selectedPdf]
  )

  useEffect(() => {
    let handLandmarker
    let animationFrameId
    // let holding = false
    
    /* 클릭 관련 변수 */
    let holding = false
    let is_clicked = false
    let hold_start_time: Date | null = null
    let hold_end_time: Date
    let last_click_time: number = 2001

    /* History, Count */
    const history: string[] = ['???']
    const SUBSITUTION_COUNT = 5 // 제스처 교체 카운트 기준
    const countMap = new Map()
    countMap.set('HOLD', 0)
    countMap.set('POINTER', 0)
    countMap.set('ZOOM', 0)
    countMap.set('ZOOM_POINTER', 0)
    countMap.set('???', 0)

    /* 위치, 속도 관련 변수 */
    let last_location: Coordinate = { x: 0, y: 0 }
    const standard_speed = interpolate(window.innerHeight)

    window.addEventListener('resize', handleWindowSize)

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
    const drawLandmarks = (landmarksArray: [], gestureNow: string) => {
      const canvas = gestureRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 1
      if (landmarksArray.length != 0) {
        let pointer: Coordinate
        if (gestureNow == 'HOLD') {
          pointer = getPointer(landmarksArray, canvas)
          ctx.fillStyle = 'green'
          if (!holding) { //아직 홀드안했을때
            setTimeout(
              () =>
                slideRef[0].current.dispatchEvent(
                  simulateMouseEvent('mousedown', pointer.x, pointer.y)
                ),
              500
            )
          } else { //홀드중
            slideRef[0].current.dispatchEvent(simulateMouseEvent('mousemove', pointer.x, pointer.y))
          }
        } else {
          if (gestureNow == 'POINTER') {
            pointer = getPointer(landmarksArray, canvas)
            ctx.fillStyle = 'red'
          } else {
            pointer = getZoomPointer(landmarksArray, canvas)
            ctx.fillStyle = 'blue'
          }
          slideRef[0].current.dispatchEvent(simulateMouseEvent('mouseup'))
        }
        // 빨간색 점 그리기
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 1, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    //제스처 예측 및 처리
    const predictGesture = (landmarks): void => {
      let update_flag: boolean = false
      let gesture: string = '???'
      const last_data = history[history.length - 1] // 가장 마지막에 인식된 제스처
      const cur_location: Coordinate = {
        x: landmarks[0][8].x,
        y: landmarks[0][8].y
      }
      const speed_per_frame: number =
        Math.sqrt(
          (cur_location.x - last_location.x) ** 2 + (cur_location.y - last_location.y) ** 2
        ) * 1000

      if (history.length > 10) {
        history.shift()
      }

      if (speed_per_frame < standard_speed) {
        const cur_gesture = getGesture(landmarks)
        if (cur_gesture == last_data) {
          gesture = last_data
        } else {
          for (const count of countMap.values()) {
            if (count >= SUBSITUTION_COUNT) update_flag = true
          }
          if (update_flag) {
            gesture = cur_gesture // 카운터 초과 시 새로운 제스처로 변경
            countMap.forEach((value, key) => {
              countMap.set(key, 0) // 모든 카운트 0으로 초기화
            })
          } else {
            countMap.set(cur_gesture, countMap.get(cur_gesture) + 1)
            gesture = last_data // 이전 제스처 유지
          }
        }
      } else {
        gesture = last_data // 강제조정
      }
      history.push(gesture)
      last_location = cur_location
      drawLandmarks(landmarks, gesture)
      checkClick(gesture, last_data)
    }

    //비디오에서 손 감지
    const detectHands = (): void => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = handLandmarker.detectForVideo(videoRef.current, performance.now())
        if (results.landmarks.length > 0) {
          predictGesture(results.landmarks) // 제스처 예측
        } else {
          const canvas = gestureRef.current
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
      requestAnimationFrame(detectHands) // 프레임 변하면 재귀적으로 호출(반복)
      // setTimeout(detectHands, 100)
    }

    const checkClick = (gesture: string, last_data: string): void => {
      if (gesture === 'HOLD' && last_data !== 'HOLD') {
        holding = true
        hold_start_time = new Date()
      } else if (last_data === 'HOLD' && gesture !== 'HOLD') {
        holding = false
        const temp = hold_end_time
        hold_end_time = new Date()

        /* 클릭 체크 */
        if (hold_start_time != null && hold_end_time.getTime() - hold_start_time.getTime() < 500) {
          console.log('click!') // 클릭 이벤트 실행
          is_clicked = true
        }
        /* 더블클릭 체크 */
        if (temp != undefined) {
          if (
            is_clicked &&
            hold_end_time.getTime() - temp.getTime() < 600 &&
            hold_end_time.getTime() - last_click_time > 2000
          ) {
            console.log('double click!') // 더블클릭 이벤트 실행
            last_click_time = hold_end_time.getTime()
            is_clicked = false
          }
        }
      }
    }

    //웹캠 시작시킨 후 initial hand detection
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream
        await initializeHandDetection()
      } catch (error) {
        console.error('Error accessing webcam:', error)
      }
    }

    startWebcam()

    // cleanUp function (component unmount시 실행)
    return () => {
      window.removeEventListener('resize', handleWindowSize)
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
      <div style={{ width: '100%', height: '100%', backgroundColor: 'blue' }}>
        <Slider {...settings}>
          {selectedPdfList &&
            selectedPdfList.map((url, index) => (
              <div key={`Page ${index + 1}`} style={{ width: 800, borderColor: 'red' }}>
                <img
                  src={url}
                  ref={slideRef[index]}
                  alt={`Page ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
        </Slider>
        <canvas
          ref={gestureRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        ></canvas>
      </div>
    </>
  )
}

export default Presentation
