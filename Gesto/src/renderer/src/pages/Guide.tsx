import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import holdImage from '../assets/img/hold.png'
import holdPrepareImage from '../assets/img/hold-prepare.png'
import dragImage from '../assets/img/drag-slide.png'
import pointerImage from '../assets/img/pointer.png'
import zpImage from '../assets/img/zoom-pointer.png'
import zoomImage from '../assets/img/zoom.png'
import tabImage from '../assets/img/tab-control.png'
import tabOnImage from '../assets/img/tab-on.png'
import tabOffImage from '../assets/img/tab-off.png'

function Guide(): JSX.Element {
  const [selectedSection, setSelectedSection] = useState('slide') // 선택된 섹션을 상태로 관리
  const navigate = useNavigate()

  const handleSectionChange = (section: string) => {
    setSelectedSection(section)
  }

  return (
    <>
      <div className="side-bar">
        {/* 바에서 섹션을 선택할 수 있는 링크들 */}
        <div className="guide-title">사용 가이드</div>
        <div
          className={`section ${selectedSection === 'slide' ? 'selected' : ''}`}
          onClick={() => handleSectionChange('slide')}
        >
          <span className="motion-name">슬라이드 넘기기</span>
        </div>
        <div
          className={`section ${selectedSection === 'pointer' ? 'selected' : ''}`}
          onClick={() => handleSectionChange('pointer')}
        >
          <span className="motion-name">포인터</span>
        </div>
        <div
          className={`section ${selectedSection === 'zoom' ? 'selected' : ''}`}
          onClick={() => handleSectionChange('zoom')}
        >
          <span className="motion-name">확대 & 축소</span>
        </div>
        <div
          className={`section ${selectedSection === 'quickzoom' ? 'selected' : ''}`}
          onClick={() => handleSectionChange('quickzoom')}
        >
          <span className="motion-name">빠른 확대 & 축소</span>
        </div>
        <div
          className={`section ${selectedSection === 'tabcontrol' ? 'selected' : ''}`}
          onClick={() => handleSectionChange('tabcontrol')}
        >
          <span className="motion-name">상단 탭 제어</span>
        </div>
      </div>
      <div className="page-box">
        {selectedSection === 'slide' && (
          <div className="guide-section">
            <img className="img-guide" src={holdImage} width="200" alt="" />
            <h3 className="gesture-desc">화면 앞에서 손을 위 모양처럼 만듭니다. (Pinch)</h3>
            <img className="img-guide" src={dragImage} width="400" />
            <h3 className="gesture-desc">
              Pinch 제스처를 유지한 채로 손을 좌우로 움직여 슬라이드를 넘길 수 있습니다.
            </h3>
          </div>
        )}
        {selectedSection === 'pointer' && (
          <div className="guide-section">
            <img className="img-guide" src={pointerImage} width="200" alt="" />
            <h3 className="gesture-desc">
              화면 앞에서 손을 위 그림처럼 만들면 해당 위치에 포인터가 나타납니다.
            </h3>
          </div>
        )}
        {selectedSection === 'zoom' && (
          <div className="guide-section">
            <img className="img-guide" src={zpImage} width="400" alt="" />
            <h3 className="gesture-desc">
              화면 앞에 두 손을 위 그림처럼 만들면 확대/축소될 지점을 볼 수 있습니다.
            </h3>
            <img className="img-guide" src={zoomImage} width="400" alt="" />
            <h3 className="gesture-desc">
              엄지와 검지를 붙이고, 두 손 사이 간격을 조절하여 확대와 축소를 진행합니다.
            </h3>
          </div>
        )}
        {selectedSection === 'quickzoom' && (
          <div className="guide-section">
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
        )}
        {selectedSection === 'tabcontrol' && (
          <div className="guide-section">
            <img className="img-guide" src={tabOnImage} width="400" alt="" />
            <h3 className="gesture-desc">최상단 영역을 클릭하여 탭을 내릴 수 있습니다.</h3>
            <img className="img-guide" src={tabImage} width="400" alt="" />
            <h3 className="gesture-desc">
              Pinch 제스처를 취한 채로 좌우로 움직이면 빠르게 다른 슬라이드로 이동할 수 있습니다.
            </h3>
            <img className="img-guide" src={tabOffImage} width="400" alt="" />
            <h3 className="gesture-desc">하단 영역을 클릭하여 탭을 올릴 수 있습니다.</h3>
          </div>
        )}
      </div>
    </>
  )
}

export default Guide
