import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import holdImage from '../assets/img/hold.png'
import holdPrepareImage from '../assets/img/hold-prepare.png'
import dragImage from '../assets/img/drag-slide.png'
import pointerImage from '../assets/img/pointer.png'
import zpImage from '../assets/img/zoom-pointer.png'
import zoomImage from '../assets/img/zoom.png'
import tabControlImage from '../assets/img/tab-control.png'
import tabOnImage from '../assets/img/tap-on.png'
import tabOffImage from '../assets/img/tap-off.png'

function Guide(): JSX.Element {
  return (
    <>
      <div className="page-box">
        <div id="guide-title">제스처 사용 가이드</div>
        <div className="guide-section">
          <h2 className="motion-name">슬라이드 넘기기</h2>
          <img className="img-guide" src={holdImage} width="200" alt="" />
          <h3 className="gesture-desc">화면 앞에서 손을 위 모양처럼 만듭니다.</h3>
          <img className="img-guide" src={dragImage} width="400" />
          <h3 className="gesture-desc">
            홀드 제스처를 유지한 채로 손을 좌우로 움직여 슬라이드를 넘길 수 있습니다.
          </h3>
        </div>
        <div className="guide-section">
          <h2 className="motion-name">포인터</h2>
          <img className="img-guide" src={pointerImage} width="200" alt="" />
          <h3 className="gesture-desc">
            화면 앞에서 손을 위 그림처럼 만들면 해당 위치에 포인터가 나타납니다.
          </h3>
        </div>
        <div className="guide-section">
          <h2 className="motion-name">확대 & 축소</h2>
          <img className="img-guide" src={zpImage} width="400" alt="" />
          <h3 className="gesture-desc">
            화면 앞에 두 손을 위 그림처럼 만들면 확대/축소될 지점을 볼 수 있습니다.
          </h3>
          <img className="img-guide" src={zoomImage} width="400" alt="" />
          <h3 className="gesture-desc">
            엄지와 검지를 붙이고, 두 손 사이 간격을 조절하여 확대와 축소를 진행합니다.
          </h3>
        </div>
        <div className="guide-section">
          <h2 className="motion-name">빠른 확대 & 축소</h2>
          <img className="img-guide" src={holdPrepareImage} width="200" alt="" />
          <h3 className="gesture-desc">화면 앞에서 손을 위 그림처럼 만듭니다.</h3>
          <img className="img-guide" src={holdImage} width="200" alt="" />
          <h3 className="gesture-desc">
            빠르게 엄지와 검지를 붙였다 떼면 해당 지점을 클릭할 수 있습니다.
          </h3>
          <h3 className="gesture-desc">
            클릭을 두 번 연속으로 진행(더블 클릭)하면, 해당 지점을 빠르게 확대하고 축소시킬 수
            있습니다.
          </h3>
        </div>
        <div className="guide-section">
          <h2 className="motion-name">상단 탭 제어</h2>
          <img className="img-guide" src={tabControlImage} width="200" alt="" />
          <h3 className="gesture-desc">화면 앞에서 손을 위 그림처럼 만듭니다.</h3>
          <img className="img-guide" src={tabOnImage} width="300" alt="" />
          <h3 className="gesture-desc">아래 방향으로 쓸어내려 상단 탭을 내릴 수 있습니다.</h3>
          <img className="img-guide" src={dragImage} width="400" alt="" />
          <h3 className="gesture-desc">
            탭 위에서 홀드 제스처로 빠르게 다른 슬라이드로 전환할 수 있습니다.
          </h3>
          <img className="img-guide" src={tabOffImage} width="300" alt="" />
          <h3 className="gesture-desc">위 방향으로 쓸어올려 상단 탭을 없앨 수 있습니다.</h3>
        </div>
      </div>
    </>
  )
}

export default Guide
