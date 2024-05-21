// 좌표 재설정
function refactorCoordinate(x, y, z) {
  return [Math.abs(x * 100 - 100), Math.abs(y * 100 - 100), z * 100]
}

// 3차원 공간에서 두 점 사이의 벡터를 구하는 함수
function getVector(x1, y1, z1, x2, y2, z2) {
  // 방향: (x1, y1, z1) -> (x2, y2, z2)
  return [x2 - x1, y2 - y1, z2 - z1]
}

// 두 벡터 사이의 각도를 구하는 함수
function getAngle(v1, v2) {
  // 내적 계산
  const dotProduct = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]

  // 각 벡터의 크기 계산
  const magnitudeV1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2)
  const magnitudeV2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2)

  // cosθ 값 계산
  const cosTheta = dotProduct / (magnitudeV1 * magnitudeV2)

  // 각도 계산
  const radians = Math.acos(cosTheta)

  // 라디안 -> 도 단위 변환
  const degrees = radians * (180 / Math.PI)

  if (degrees > 180) {
    degrees = 360 - degrees
  }

  return degrees.toFixed(1)
}

// 3차원 공간에서 두 점 사이의 거리 계산 함수
function getDistance(x1, y1, z1, x2, y2, z2) {
  const deltaX = x2 - x1
  const deltaY = y2 - y1
  const deltaZ = z2 - z1
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ)

  return distance
}

// 엄지를 제외한 손가락의 접힘 여부 판단
function isFingerFold(landmarks, fingerNum, angle1, angle2, angle3) {
  // Finger Index: (1) 검지, (2) 중지, (3) 약지, (4) 새끼

  const wrist = landmarks[0] // 손목
  const node1 = landmarks[1 + 4 * fingerNum] // 첫 번째 관절
  const node2 = landmarks[2 + 4 * fingerNum] // 두 번째 관절
  const node3 = landmarks[3 + 4 * fingerNum] // 세 번째 관절
  const node4 = landmarks[4 + 4 * fingerNum] // 손가락 끝

  let nodes = [wrist, node1, node2, node3, node4]
  let angles = [0, 0, 0] // 각도 관계는 총 3가지, (wrist, n1)과 (n1, n2), (n1, n2)와 (n2, n3), (n2, n3)과 (n3, n4)

  for (let i = 0; i < 5; i++) {
    nodes[i] = refactorCoordinate(nodes[i].x, nodes[i].y, nodes[i].z) // 각 노드(랜드마크) 좌표 재구성
  }

  for (let i = 1; i < 4; i++) {
    const prev = nodes[i - 1] // 이전 노드
    const cur = nodes[i] // 현재 노드
    const next = nodes[i + 1] // 다음 노드

    // 이전-현재, 현재-다음 노드의 벡터 계산
    const v1 = getVector(prev[0], prev[1], prev[2], cur[0], cur[1], cur[2])
    const v2 = getVector(cur[0], cur[1], cur[2], next[0], next[1], next[2])

    // 두 벡터가 이루는 각도 저장 - 한 관절이 접혔는지 판단하는 요소
    angles[i - 1] = getAngle(v1, v2)
  }
  // console.log(fingerNum, angles);
  if (angles[0] >= angle1 && angles[1] >= angle2 && angles[2] >= angle3) {
    return true
  } else return false
}

function isFingerStraight(landmarks, fingerNum) {
  // Finger Index: (1) 검지, (2) 중지, (3) 약지, (4) 새끼

  let wrist = landmarks[0]
  const node1 = landmarks[1 + 4 * fingerNum] // 첫 번째 관절
  const node2 = landmarks[2 + 4 * fingerNum] // 두 번째 관절
  const node3 = landmarks[3 + 4 * fingerNum] // 세 번째 관절
  const node4 = landmarks[4 + 4 * fingerNum] // 손가락 끝

  let nodes = [node1, node2, node3, node4]
  let angles = [0, 0] // 각도 관계는 총 2가지, (n1, n2)와 (n2, n3), (n2, n3)과 (n3, n4)

  wrist = refactorCoordinate(wrist.x, wrist.y, wrist.z)
  for (let i = 0; i < 4; i++) {
    nodes[i] = refactorCoordinate(nodes[i].x, nodes[i].y, nodes[i].z) // 각 노드(랜드마크) 좌표 재구성
  }

  /* 각도 비교 -> 관절 각도가 펴졌는지 확인 (카메라방향 수직으로 가리키면 인식률 낮음) */
  for (let i = 1; i < 3; i++) {
    const prev = nodes[i - 1] // 이전 노드
    const cur = nodes[i] // 현재 노드
    const next = nodes[i + 1] // 다음 노드

    // 이전-현재, 현재-다음 노드의 벡터 계산
    const v1 = getVector(prev[0], prev[1], prev[2], cur[0], cur[1], cur[2])
    const v2 = getVector(cur[0], cur[1], cur[2], next[0], next[1], next[2])

    // 두 벡터가 이루는 각도 저장 - 한 관절이 접혔는지 판단하는 요소
    angles[i - 1] = getAngle(v1, v2)
  }
  if (angles[0] <= 30 && angles[1] <= 30) {
    return true
  } else return false
}

// 엄지 끝과 특정 손가락 끝이 붙어있는지 판단하는 함수
function areTipsTouching(landmarks, fingerNum, distance) {
  let thumb_tip = landmarks[4]
  let other_tip = landmarks[4 * fingerNum + 4]

  thumb_tip = refactorCoordinate(thumb_tip.x, thumb_tip.y, thumb_tip.z)
  other_tip = refactorCoordinate(other_tip.x, other_tip.y, other_tip.z)

  const dist = getDistance(
    thumb_tip[0],
    thumb_tip[1],
    thumb_tip[2],
    other_tip[0],
    other_tip[1],
    other_tip[2]
  )
  if (dist <= distance) {
    return true
  } else return false
}

// 엄지 끝과 특정 손가락 끝이 서로 바라보는 방향인지 판단하는 함수
export function areTipsFacing(landmarks, fingerNum) {
  let dip = refactorCoordinate(
    landmarks[4 * fingerNum + 3].x,
    landmarks[4 * fingerNum + 3].y,
    landmarks[4 * fingerNum + 3].z
  )
  let tip = refactorCoordinate(
    landmarks[4 * fingerNum + 4].x,
    landmarks[4 * fingerNum + 4].y,
    landmarks[4 * fingerNum + 4].z
  )
  let thumb_tip = refactorCoordinate(landmarks[4].x, landmarks[4].y, landmarks[4].z)

  const v = getVector(dip[0], dip[1], dip[2], tip[0], tip[1], tip[2])
  const thumb_v = getVector(dip[0], dip[1], dip[2], thumb_tip[0], thumb_tip[1], thumb_tip[2])

  const dotProduct = v[0] * thumb_v[0] + v[1] * thumb_v[1] + v[2] * thumb_v[2]
  if (dotProduct > 0) {
    return true
  } else return false
}

export function getGesture(landmarks) {
  let first_hand = landmarks[0]
  let second_hand = undefined
  if (landmarks.length > 1) {
    // 두 손이 인식될 때
    if (landmarks[0][0].x < landmarks[1][0].x) {
      first_hand = landmarks[1]
      second_hand = landmarks[0]
    } else {
      second_hand = landmarks[1]
    }
  }

  if (second_hand == undefined) {
    /* HOLD */
    if (
      isFingerFold(first_hand, 3, 20, 45, 0) ||
      isFingerFold(first_hand, 4, 20, 45, 0) ||
      (isFingerFold(first_hand, 2, 20, 45, 0) && areTipsFacing(first_hand, 1))
    ) {
      if (areTipsTouching(first_hand, 1, 5)) {
        return 'HOLD'
      } else if (areTipsTouching(first_hand, 1, 12)) {
        return 'POINTER'
      }
    }

    /* POINTER */
    if (
      isFingerStraight(first_hand, 1) &&
      (isFingerFold(first_hand, 3, 10, 80, 10) ||
        isFingerFold(first_hand, 3, 80, 10, 10) ||
        isFingerFold(first_hand, 4, 10, 80, 10) ||
        isFingerFold(first_hand, 4, 80, 10, 10))
    ) {
      return 'POINTER'
    }
    return '???'
  } else {
    // 두 손인 경우
    if (
      isFingerFold(first_hand, 3, 20, 50, 10) &&
      isFingerFold(first_hand, 4, 20, 50, 10) &&
      isFingerFold(first_hand, 2, 20, 50, 10) &&
      isFingerFold(second_hand, 3, 20, 50, 10) &&
      isFingerFold(second_hand, 4, 20, 50, 10) &&
      isFingerFold(second_hand, 2, 20, 50, 10)
    ) {
      if (areTipsTouching(first_hand, 1, 5) && areTipsTouching(second_hand, 1, 5)) {
        return 'ZOOM'
      } else {
        return 'ZOOM_POINTER'
      }
    } else {
      return '???'
    }
  }
}

// 캔버스에 그려야하는 포인터 좌표를 반환 (POINTER)
export function getPointer(landmarks, canvas) {
  let pointer = landmarks[0][8]
  pointer = refactorCoordinate(pointer.x, pointer.y, pointer.z)
  const percentX = pointer[0]
  const percentY = pointer[1]
  const canvasX = canvas.width * (percentX / 100)
  const canvasY = canvas.height * (1 - percentY / 100)
  return { x: canvasX, y: canvasY }
}

// 줌 거리 반환 (두 손 엄지 사이)
export function getZoomDistance(landmarks) {
  const fst_hand = landmarks[0]
  const sec_hand = landmarks[1]
  const fst_idx = refactorCoordinate(fst_hand[4].x, fst_hand[4].y, fst_hand[4].z)
  const sec_idx = refactorCoordinate(sec_hand[4].x, sec_hand[4].y, sec_hand[4].z)
  return getDistance(fst_idx[0], fst_idx[1], fst_idx[2], sec_idx[0], sec_idx[1], sec_idx[2])
}

// 캔버스에 그려야하는 포인터 좌표를 반환 (ZOOM, ZOOM_POINTER)
export function getZoomPointer(landmarks, canvas) {
  if (landmarks[1] != undefined) {
    const fst_hand = landmarks[0]
    const sec_hand = landmarks[1]
    const fst_idx = refactorCoordinate(fst_hand[8].x, fst_hand[8].y, fst_hand[8].z)
    const fst_thumb = refactorCoordinate(fst_hand[4].x, fst_hand[4].y, fst_hand[4].z)
    const sec_idx = refactorCoordinate(sec_hand[8].x, sec_hand[8].y, sec_hand[8].z)
    const sec_thumb = refactorCoordinate(sec_hand[4].x, sec_hand[4].y, sec_hand[4].z)

    let sumX = fst_idx[0] + fst_thumb[0] + sec_idx[0] + sec_thumb[0]
    let sumY = fst_idx[1] + fst_thumb[1] + sec_idx[1] + sec_thumb[1]

    const centerX = sumX / 4
    const centerY = sumY / 4

    const canvasX = canvas.width * (centerX / 100)
    const canvasY = canvas.height * (1 - centerY / 100)

    return { x: canvasX, y: canvasY }
  } else return { x: null, y: null }
}
