// src/pages/B2T.jsx
import { useEffect, useRef, useState } from "react";
import { API_BASE, WS_BASE } from "../axios/apiUrl";

import "../styles/B2T.css";
import consonantImg from "../assets/자음.svg";
import gatherImg from "../assets/모음.svg";
import numberImg from "../assets/숫자.svg";

export const B2T = () => {
  // --- refs & states ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [camError, setCamError] = useState("");
  const [wsState, setWsState] = useState("DISCONNECTED");

  const [overlayLines, setOverlayLines] = useState([]); // 웹캠 오버레이
  const OVERLAY_KEEP_MS = 4500;
  const OVERLAY_MAX = 8;

  // 채팅(디코드 결과)
  const [chatMessages, setChatMessages] = useState([]); // {id, text, time}
  const chatScrollRef = useRef(null);

  // TTS
  const [ttsEnabled] = useState(true);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const voiceRef = useRef(null);

  // --- utils ---
  function nowTime() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function addChat(text) {
    setChatMessages((prev) => [...prev, { id: crypto.randomUUID(), text, time: nowTime() }]);
  }

  function pushOverlay(line) {
    setOverlayLines((prev) => {
      const next = [...prev, line].slice(-OVERLAY_MAX);
      return next;
    });
    setTimeout(() => {
      setOverlayLines((prev) => {
        const idx = prev.indexOf(line);
        if (idx === -1) return prev;
        const cp = [...prev];
        cp.splice(idx, 1);
        return cp;
      });
    }, OVERLAY_KEEP_MS);
  }

  function getSid() {
    const k = "blink_sid";
    let sid = localStorage.getItem(k);
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10);
      localStorage.setItem(k, sid);
    }
    return sid;
  }

  function wsUrl() {
    return `${WS_BASE}/ws/blink/${getSid()}/`;
  }

  // --- TTS ---
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    function pickVoice() {
      const voices = synth.getVoices?.() || [];
      const ko =
        voices.find((v) => v.lang?.toLowerCase() === "ko-kr") ||
        voices.find((v) => (v.lang || "").toLowerCase().startsWith("ko")) ||
        voices[0];
      voiceRef.current = ko || null;
    }

    // 크롬은 비동기 로딩
    pickVoice();
    synth.onvoiceschanged = pickVoice;

    // 모바일/사파리 예열(첫 사용자 제스처에 무음 발화)
    const warmup = () => {
      try {
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        u.rate = 1;
        u.pitch = 1;
        u.lang = "ko-KR";
        if (voiceRef.current) u.voice = voiceRef.current;
        synth.speak(u);
      } catch {}
      window.removeEventListener("click", warmup);
      window.removeEventListener("touchstart", warmup);
    };
    window.addEventListener("click", warmup, { once: true });
    window.addEventListener("touchstart", warmup, { once: true });

    return () => {
      synth.onvoiceschanged = null;
      window.removeEventListener("click", warmup);
      window.removeEventListener("touchstart", warmup);
    };
  }, []);

  function speakKorean(text) {
    const synth = synthRef.current;
    if (!synth || !text) return;
    try {
      synth.cancel(); // 겹치기 방지
    } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 1.0;
    u.pitch = 1.0;
    u.volume = 1.0;
    synth.speak(u);
  }

  // 채팅 자동 스크롤
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  // --- camera ---
  async function startCamera() {
    setCamError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 }, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
      setStream(media);
    } catch (err) {
      setCamError(err?.message || "카메라를 시작할 수 없어요.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  // --- websocket ---
  function openWS() {
    const url = wsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setWsState("CONNECTING");

    ws.onopen = () => {
      setWsState("OPEN");
      pushOverlay(`[WS 연결됨] sid=${getSid()}`);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => tickSend(), 60); // ~16–17fps
    };

    ws.onerror = () => {
      pushOverlay("[WS 오류]");
    };

    ws.onclose = () => {
      setWsState("CLOSED");
      pushOverlay("[WS 종료]");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case "ready":
          pushOverlay("[준비 완료]");
          break;
        case "calib":
          pushOverlay(`[보정] base=${msg.base} close=${msg.close} open=${msg.open}`);
          break;
        case "start":
          pushOverlay("[START] 전환 시작");
          break;
        case "morse":
          pushOverlay(`전환 : ${msg.morse || ""}`);
          break;
        case "space":
          pushOverlay(`띄어쓰기 추가: ${msg.morse || ""}`);
          break;
        case "end": {
          pushOverlay("[END] 전환 종료");
          const finalText = (msg.text || "").trim();
          if (finalText) {
            addChat(finalText);
            if (ttsEnabled) speakKorean(finalText);
          }
          break;
        }
        case "error":
          pushOverlay(`[error] ${msg.message || ""}`);
          break;
        default:
          break;
      }
    };
  }

  function closeWS() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setWsState("DISCONNECTED");
  }

  function tickSend() {
    const v = videoRef.current;
    if (!v || !v.srcObject) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");

    const TX_W = 320,
      TX_H = 240;
    c.width = TX_W;
    c.height = TX_H;
    ctx.drawImage(v, 0, 0, TX_W, TX_H);

    let b64 = c.toDataURL("image/webp", 0.8);
    if (!b64.startsWith("data:image/webp")) b64 = c.toDataURL("image/jpeg", 0.9);

    const ts = Date.now() / 1000.0;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "frame", ts, data: b64 }));
    }
  }

  // --- lifecycle ---
  useEffect(() => {
    startCamera().then(() => openWS());
    return () => {
      closeWS();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- UI ---
  return (
    <div className="b2t">
      <div className="b2t-container">
        {/* 상단: 좌(웹캠) / 우(채팅) */}
        <section className="b2t-top">
          {/* 웹캠 */}
          <div className="video-pane">
            <div className="video-wrap">
              <video
                ref={videoRef}
                className="preview-video"
                muted
                playsInline
                autoPlay
                aria-label="웹캠 미리보기"
              />
              {/* 오버레이 */}
              <div className="video-overlay" aria-live="polite">
                {overlayLines.map((line, i) => (
                  <div className="overlay-line" key={`${line}-${i}`}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* 컨트롤 */}
            <div className="video-controls">
              {stream ? (
                <button className="video-btn" onClick={stopCamera}>
                  카메라 끄기
                </button>
              ) : (
                <button className="video-btn" onClick={startCamera}>
                  카메라 켜기
                </button>
              )}
            </div>
          </div>

          {/* 채팅(디코드 결과가 여기에 누적) */}
          <aside className="chat-pane" aria-label="대화 내용">
            <div className="chat-scroll" ref={chatScrollRef}>
              {chatMessages.map((m) => (
                <div className="msg left" key={m.id}>
                  <div className="bubble">
                    {m.text}
                  </div>
                  <time className="time" dateTime={m.time}>
                    {m.time}
                  </time>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* 하단 모스부호 표 */}
        <section className="morse-board">
          <div className="sheet-wrap">
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
  );
};

export default B2T;
