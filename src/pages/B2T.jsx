import { useEffect, useRef, useState } from 'react'

import '../styles/B2T.css';
import consonantImg from '../assets/자음.svg';
import gatherImg from '../assets/모음.svg';
import numberImg from '../assets/숫자.svg';

export const B2T = () => {
    const videoRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [camError, setCamError] = useState('')

  // 데모 메시지 (우측 말풍선)
  const messages = [
    { id: 1, text: '안녕하세요요옹', time: '15:32' },
    { id: 2, text: '안녕하세요요옹', time: '15:32' },
    { id: 3, text: '안녕하세요요옹', time: '15:32' },
    { id: 4, text: '안녕하세요요옹', time: '15:32' },
    { id: 5, text: '긴문장 ㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣㅣ', time: '15:32' },
  ]

  async function startCamera() {
    setCamError('')
    try {
      // 권장 해상도/전면카메라(노트북) 설정
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // 전면
        },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = media
        await videoRef.current.play()
      }
      setStream(media)
    } catch (err) {
      setCamError(err?.message || '카메라를 시작할 수 없어요.')
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    // 자동 시작
    startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="b2t">
      <div className="b2t-container">
        {/* 상단: 좌(웹캠) / 우(채팅) */}
        <section className="b2t-top">
          {/* 왼쪽: 웹캠 박스 */}
            <div className="video-pane">
                <video
                    ref={videoRef}
                    className="preview-video"
                    muted
                    playsInline
                    autoPlay
                    aria-label="웹캠 미리보기"
                />
                {camError && (
                <div className="video-error">
                    <p>{camError}</p>
                    <p className="hint">
                        권한을 허용했는지 확인하고, 브라우저를 재시작해보세요.
                    </p>
                    <button className="video-btn" onClick={startCamera}>다시 시도</button>
                </div>
                )}
                <div className="video-controls">
                {stream ? (
                    <button className="video-btn" onClick={stopCamera}>카메라 끄기</button>
                ) : (
                    <button className="video-btn" onClick={startCamera}>카메라 켜기</button>
                )}
                </div>
            </div>

            <aside className="chat-pane" aria-label="대화 내용">
                <div className="chat-scroll">
                {messages.map(m => (
                    <div className="msg left" key={m.id}>
                    <div className="bubble">{m.text}</div>
                    <time className="time" dateTime={m.time}>{m.time}</time>
                    </div>
                ))}
                </div>
            </aside>
        </section>

        <section className="morse-board">
            <div className='sheet-wrap'>
                <div className="sheet sheet1">
                    <img src={consonantImg} alt="모스부호 자음 표" className="sheet-img" />
                </div>
                <div className="sheet sheet2">
                    <img src={gatherImg} alt="모스부호 모음 표" className="sheet-img" />
                </div>
            </div>
            <div className="sheet3">
                <img src={numberImg} alt="모스부호 숫자 표" />
            </div>
        </section>
      </div>
    </div>
  )

}