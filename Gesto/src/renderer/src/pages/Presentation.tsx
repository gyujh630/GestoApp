import { useCallback, useEffect, useRef, useState } from 'react'
import { ipcRenderer, screen } from 'electron'
import useStore from '@renderer/store/store'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import {
  getGesture,
  getPointer,
  getZoomPointer,
  getZoomDistance,
  interpolate
} from '../assets/gestureUtil'
import Slider from 'react-slick'
import { useNavigate } from 'react-router-dom'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";



const zoomSrc = 'src/assets/img/zoom2.png'
const dragSrc = 'src/assets/img/drag_1.png'




export interface Coordinate {
  x: number
  y: number
}

function Presentation(): JSX.Element {
  const navigate = useNavigate()

  //선택된 pdf파일
  const selectedPdf = useStore((state) => state.selectedPdf)
  const selectedPdfList = useStore((state) => state.selectedPdfList)
  const setTopBarState = useStore((state) => state.setTopBarState)

  const slideRef = Array.from({ length: selectedPdfList.length }).map(() => useRef())
  const gestureRef = useRef(null)
  const videoRef = useRef(null)
  const carouselRef = useRef(null)
  const topCarouselRef = useRef(null)
  const topSlideRef = Array.from({ length: 5 }).map(() => useRef())

  const [slidePadding,setSlidePadding] = useState(0);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  }

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

  const 
  handleWindowSize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    setSlidePadding((windowSize.height-slideRef[0].current.offsetHeight)/2)
  }
  const handleEsc = (event) => {
    if (event.key === 'Escape') {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      navigate('/PreparePresentation')
      setTopBarState(true)
    }
  }

  //pdf그리기
  const renderPage = useCallback(
    async (pageNum, pdf = selectedPdf) => {
      if (pdf) {
        await pdf.getPage(pageNum).then(function (page) {
          const viewport = page.getViewport({ scale: 1 })
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

  let slideDistTop;
  

  const zoomWithDblClick = (e) => {
    const INITIAL_SCALE = 1
    const MAXIMUM_SCALE = 3
    const transformValue = e.target.style.transform
    // transform 값에서 scale 부분 추출
    const scaleValue = transformValue.match(/scale\(([^)]+)\)/)?.[1]
    if (scaleValue == INITIAL_SCALE) {
      e.target.style.transformOrigin = `${e.clientX}px ${e.clientY - slideDistTop}px`
      e.target.style.transform = `scale(${MAXIMUM_SCALE})`
    } else {
      e.target.style.transformOrigin = `${e.clientX}px ${e.clientY - slideDistTop}px`
      e.target.style.transform = `scale(${INITIAL_SCALE})`
    }
  }
  const slideDirection = (e) => {
    if (e.keyCode == 37) {
      carouselRef.current.slickPrev()
    } else if (e.keyCode == 39) {
      carouselRef.current.slickNext()
    }
  }

  useEffect(() => {
    // ipcRenderer.send('set-full-screen', true);
    let handLandmarker
    let animationFrameId

    //DOM 변수
    const carousel = carouselRef.current
    const carouselIndex = carousel.innerSlider.state.currentSlide
    const target = slideRef[carouselIndex].current
    const distTop = target.getBoundingClientRect().y
    slideDistTop = distTop

    /* 클릭 관련 변수 */
    let holding = false
    let is_clicked = false
    let hold_start_time: Date | null = null
    let hold_end_time: Date
    let last_click_time: number = 2001
    /* ZOOM 관련 변수 */

    //줌 찍혔을때 포인트
    let initialPoint: Coordinate = {
      x: 0,
      y: 0
    }
    //초점 좌표
    const prevInitialPoint: Coordinate = {
      x: 0,
      y: 0
    }
    //scale 값 (변화)
    let zoom_rate = 100
    //줌 중인지 여부
    let zoom_ing = false
    let zoom_start_dist = 0
    //확대축소 결정 기준 값
    const prev_zoom_rate: number = 100

    const MIN_ZOOM_RATE = 100
    const MAX_ZOOM_RATE = 1000

    /* History, Count */
    const history: string[] = ['???']
    const SUBSITUTION_COUNT = 5 // 제스처 교체 카운트 기준
    const countMap = new Map()
    countMap.set('TAB_CONTROL', 0)
    countMap.set('HOLD', 0)
    countMap.set('HOLD_POINTER', 0)
    countMap.set('POINTER', 0)
    countMap.set('ZOOM', 0)
    countMap.set('ZOOM_POINTER', 0)
    countMap.set('???', 0)

    /* 위치, 속도 관련 변수 */
    let last_location: Coordinate = { x: 0, y: 0 }
    const standard_speed = interpolate(window.innerHeight)

    /* 탭 컨트롤 관련 변수 */
    let tab_start_y: number
    let tab_ing: boolean = false
    let tab_state: boolean = false
    let tab_gauge: number = 0

    const zoom = new Image();
    zoom.src = zoomSrc
    const grab = new Image();
    grab.src = dragSrc
    const images = [zoomSrc,dragSrc];
    const loadedImages = {};
    
    function preloadImages() {
      for (let i = 0; i < images.length; i++) {
        const img = new Image();
        img.src = images[i];
        loadedImages[images[i]] = img;
      }
    }
    preloadImages();
    


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
      const slider = carouselRef.current
      const index = slider.innerSlider.state.currentSlide
      const targetSlide = slideRef[index].current
      const canvas = gestureRef.current;
      let startDist = 0;
      let endDist = 0;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 1
      if (landmarksArray.length != 0) {
        let pointer: Coordinate
        if (gestureNow == 'HOLD') {
          if(topCarouselRef.current.style.display!='none'){
            if(!holding){
              holding=true
              //
              startDist = getPointer(landmarksArray, canvas).x
            }
            else{

            }

          }
          else{pointer = getPointer(landmarksArray, canvas)
          ctx.fillStyle = 'green'
          if (!holding) {
            //아직 홀드안했을때
            setTimeout(
              () =>
                targetSlide.dispatchEvent(simulateMouseEvent('mousedown', pointer.x, pointer.y)),
              300
            )
          } else {
            //홀드중
            targetSlide.dispatchEvent(simulateMouseEvent('mousemove', pointer.x, pointer.y))
          }
          if (loadedImages[dragSrc]) {
            ctx.drawImage(loadedImages[dragSrc], pointer.x, pointer.y,40,40);
          } else {
            console.error('Image not preloaded:', dragSrc);
          }  

          // ctx.beginPath()
          // ctx.arc(pointer.x, pointer.y, 4, 0, 2 * Math.PI)
          // ctx.fill()
        }
        } else if (gestureNow == 'POINTER' || gestureNow == 'TAB_CONTROL') {
          pointer = getPointer(landmarksArray, canvas)
          ctx.fillStyle = 'red'
          ctx.beginPath()
          ctx.arc(pointer.x, pointer.y, 4, 0, 2 * Math.PI)
          ctx.fill()
        } else if (gestureNow == 'ZOOM_POINTER') {
          pointer = getZoomPointer(landmarksArray, canvas)
          if (loadedImages[zoomSrc]) {
            ctx.drawImage(loadedImages[zoomSrc], pointer.x, pointer.y,40,40);
          } else {
            console.error('Image not preloaded:', zoomSrc);
          }  
        } else if (gestureNow == 'ZOOM') {
          let x, y;
          let prev_rate;
          if (zoom_ing == false) {
            zoom_ing = true
            zoom_start_dist = getZoomDistance(landmarksArray)
            let newPoint = getZoomPointer(landmarksArray, canvas)
            initialPoint = {
              x: newPoint.x,
              y: newPoint.y
            }
            prev_rate = zoom_rate
          }

          if (zoom_ing) {
            // 줌 동작 진행 중
            let delta = 0.05 // 변화율
            const zoom_cur_dist = getZoomDistance(landmarksArray)
            //0~300정도의 사이값 나오는 배율 값
            let new_zoom_rate = parseInt(((zoom_cur_dist / zoom_start_dist) * 100).toFixed(0))
            zoom_rate = zoom_rate + (new_zoom_rate - prev_zoom_rate) * delta
            zoom_rate = Math.max(MIN_ZOOM_RATE, Math.min(zoom_rate, MAX_ZOOM_RATE))
            
          }
          pointer = initialPoint
          if (loadedImages[zoomSrc]) {
            ctx.drawImage(loadedImages[zoomSrc], pointer.x, pointer.y,40,40);
          } else {
            console.error('Image not preloaded:', zoomSrc);
          }  

          //초점 변화 계산식
          x = prevInitialPoint.x - (initialPoint.x * zoom_rate) / prev_rate
          y = prevInitialPoint.y - (initialPoint.y * zoom_rate) / prev_rate

          //슬라이드 영역 외의 범위는 확대 축소 안되게 범위 조절 필요
          // initialpPoint slide top~ slide top+height안에 있을때만
          if (initialPoint.y > distTop && initialPoint.y < targetSlide.offsetHeight + distTop) {
            targetSlide.style.transformOrigin = `${initialPoint.x}px ${initialPoint.y - distTop}px`;
            targetSlide.style.transform = `scale(${zoom_rate / 100})`;
          }
        }
        // 제스처 유지 관련 변수 초기화
        if (gestureNow != 'HOLD') {
          if(topCarouselRef.current.style.display=='flex'){
            endDist = getPointer(landmarksArray,canvas).x
            console.log(startDist-endDist,'@@@@')
          }
          targetSlide.dispatchEvent(simulateMouseEvent('mouseup'));
          holding = false;
        }
        if (gestureNow != 'ZOOM') {
          zoom_ing = false;
        }
      }
    }

    //제스처 예측 및 처리
    const predictGesture = (landmarks): void => {
      let update_flag: boolean = false;
      let gesture: string = '???';
      const last_data = history[history.length - 1]; // 가장 마지막에 인식된 제스처
      const cur_location: Coordinate = {
        x: landmarks[0][8].x,
        y: landmarks[0][8].y
      };
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
      checkClick(gesture, last_data, landmarks)
      checkTabControl(gesture, last_data, landmarks)
    }

    const checkClick = (gesture: string, last_data: string, landmarks): void => {
      const canvas = gestureRef.current
      const pointer = getPointer(landmarks, canvas)
      const element = document.elementFromPoint(pointer.x, pointer.y)
      if (gesture === 'HOLD' && last_data !== 'HOLD') {
        holding = true
        hold_start_time = new Date()
      } else if (last_data === 'HOLD' && gesture !== 'HOLD') {
        holding = false
        const temp = hold_end_time
        hold_end_time = new Date()

        /* 클릭 체크 */
        if (hold_start_time != null && hold_end_time.getTime() - hold_start_time.getTime() < 300) {
          element.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: pointer.x,
              clientY: pointer.y
            })
          )
          is_clicked = true
        }
        /* 더블클릭 체크 */
        if (temp != undefined) {
          if (
            is_clicked &&
            hold_end_time.getTime() - temp.getTime() < 700 &&
            hold_end_time.getTime() - last_click_time > 500
          ) {
            element.dispatchEvent(
              new MouseEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                clientX: pointer.x,
                clientY: pointer.y
              })
            )
            last_click_time = hold_end_time.getTime()
            is_clicked = false
          }
        }
      }
    }

    const checkTabControl = (gesture, last_data, landmarks) => {
      const canvas = gestureRef.current
      if (gesture === 'TAB_CONTROL' && last_data !== 'TAB_CONTROL') {
        tab_ing = true;
        tab_start_y = getPointer(landmarks, canvas).y
      } else if (last_data === 'TAB_CONTROL' && gesture !== 'TAB_CONTROL') {
        tab_ing = false;
      }

      if (tab_ing) {
        const cur_y = getPointer(landmarks, canvas).y
        const y_range = canvas.offsetHeight * 0.33 // 기준 범위
        const gauge_max = 100

        // 절댓값을 사용하여 게이지 값 계산
        const distance = Math.abs(tab_start_y - cur_y)
        const tab_gauge = Math.min((distance / y_range) * gauge_max, gauge_max).toFixed(0)

        console.log(tab_gauge)
        if (cur_y > tab_start_y + y_range && !tab_state) {
          console.log('상단바 내리기')
           topCarouselRef.current.style.display = 'flex'
           topSlideRef.forEach((el, index) => {
             el.current.src =
               selectedPdfList[carouselRef.current.innerSlider.state.currentSlide - 2 + index]
           })
          tab_state = true
        }
        if (cur_y < tab_start_y - y_range && tab_state) {
          console.log('상단바 올리기')
          topCarouselRef.current.style.display = 'none'
          tab_state = false
        }
      }
    }

    //비디오에서 손 감지
    const detectHands = (): void => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = handLandmarker.detectForVideo(videoRef.current, performance.now())
        if (results.landmarks.length > 0) {
          predictGesture(results.landmarks) // 제스처 예측
        } else {
          const canvas = gestureRef.current
          const slider = carouselRef.current
          const index = slider.innerSlider.state.currentSlide
          const targetSlide = slideRef[index].current

          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          //손 사라질시 제스처 유지 관련 변수 초기화
          // targetSlide.dispatchEvent(simulateMouseEvent('mouseup'))
          zoom_ing = false
        }
      }
      requestAnimationFrame(detectHands) // 프레임 변하면 재귀적으로 호출(반복)
      // setTimeout(detectHands, 100)
    }

    //웹캠 시작시킨 후 initial hand detection
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        console.log(videoRef.current,'@@@비디오 여깅네~')
        videoRef.current.srcObject = stream
        await initializeHandDetection()
      } catch (error) {
        console.error('Error accessing webcam:', error)
      }
    }

    startWebcam()
    setSlidePadding((windowSize.height-slideRef[0].current.offsetHeight)/2)
    window.addEventListener('resize', handleWindowSize)
    window.addEventListener('keydown', handleEsc)
    window.addEventListener('keydown', slideDirection)

    // cleanUp function (component unmount시 실행)
    return () => {
      window.removeEventListener('resize', handleWindowSize)
      window.removeEventListener('keypress', handleEsc)
      window.removeEventListener('keydown', slideDirection)
      console.log(videoRef.current)
      if (videoRef.current) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
        console.log('비디오끄기')
      }
      if (handLandmarker) {
        handLandmarker.close()
        console.log('랜마끄기')
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        console.log('애니끄기')
      }
    }
  }, [])

  return (
    <>
      <video ref={videoRef} autoPlay playsInline style={{ position:'absolute'}}></video>
      <div style={{ width: '100%', height: windowSize.height, backgroundColor: 'black',position:'relative',paddingTop:slidePadding}}>
      <Slider  ref={carouselRef} {...settings}>
          {selectedPdfList &&
            selectedPdfList.map((url, index) => (
              <div key={`Page ${index + 1}`}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    position:'relative'
                  }}
                >
                  <img
                    src={url}
                    className="scale_transition"
                    onDoubleClick={(e) => {
                      zoomWithDblClick(e)
                    }}
                    ref={slideRef[index]}
                    alt={`Page ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
            ))}
        </Slider>
            <div ref={topCarouselRef} style={{width:'100%',height:'40%',position:'absolute',top:0,left:0,backgroundColor:'tomato',display:'none',alignItems:'center',justifyContent:'space-between'}}>
            {carouselRef.current&&
              <><img
                    ref={topSlideRef[0]}
                    src={selectedPdfList[carouselRef.current.innerSlider.state.currentSlide-2]}
                    alt={`Page `}
                    style={{
                      width: 100,
                      height: 180,
                      objectFit: 'contain'
                    }}
                  />
            <img
                    ref={topSlideRef[1]}
                    src={selectedPdfList[carouselRef.current.innerSlider.state.currentSlide-1]}
                    alt={`Page `}
                    style={{
                      width: 100,
                      height: 180,
                      objectFit: 'contain'
                    }}
                  />
                  <img
                  ref={topSlideRef[2]}
                    src={selectedPdfList[carouselRef.current.innerSlider.state.currentSlide]}
                    alt={`Page `}
                    style={{
                      width: 100,
                      height: 180,
                      objectFit: 'contain'
                    }}
                  />      
                  <img
                  ref={topSlideRef[3]}
                    src={selectedPdfList[carouselRef.current.innerSlider.state.currentSlide+1]}
                    alt={`Page `}
                    style={{
                      width: 100,
                      height: 180,
                      objectFit: 'contain'
                    }}
                  />
                  <img
                  ref={topSlideRef[4]}
                    src={selectedPdfList[carouselRef.current.innerSlider.state.currentSlide+2]}
                    alt={`Page`}
                    style={{
                      width: 100,
                      height: 180,
                      objectFit: 'contain'
                    }}
                  />
                  </>
                  }
            </div>
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
