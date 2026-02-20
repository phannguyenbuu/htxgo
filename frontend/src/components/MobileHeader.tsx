import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { asset } from "../assets";
import ImageModal from "./ImageModal";
import QrScanModal from "./QrScanModal";

type ScrollDotsProps = {
  count: number;
  activeIndex: number;
};

type MobileHeaderProps = {
  scrollDots?: ScrollDotsProps;
};

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9.-]/g, "").replace(/\s+/g, "").trim();
}

export default function MobileHeader({ scrollDots: _scrollDots }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchPlate, setSearchPlate] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const speechSupported =
    typeof window !== "undefined" &&
    (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window));

  function goHome() {
    if (location.pathname !== "/") {
      navigate("/", { state: { flyIn: true } });
    } else {
      window.dispatchEvent(new CustomEvent("home-fly-replay"));
    }
  }

  function submitLookup() {
    const normalized = normalizePlate(searchPlate);
    if (!normalized) {
      return;
    }
    setSearchPlate(normalized);
    navigate(`/more/phat-nguoi?plate=${encodeURIComponent(normalized)}`);
  }

  function toggleVoice() {
    if (!speechSupported) {
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      const normalized = normalizePlate(transcript);
      if (normalized) {
        setSearchPlate(normalized);
      }
    };

    recognition.onerror = () => {
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setVoiceListening(true);
    recognition.start();
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-main">
          <button className="brand brand-btn" onClick={goHome} aria-label="Về trang chủ">
            <img src={asset("1.png")} alt="" className="brand-logo" />
            <div className="brand-copy">
              <div className="brand-title">TRỢ LÝ VICA</div>
              <div className="brand-sub">AI Agent của tài xế công nghệ</div>
            </div>
          </button>
          <div className="topbar-right">
            <button className="icon-btn qr-icon-btn" aria-label="Quét QR" onClick={() => setQrOpen(true)}>
              <img src={asset("QR.png")} alt="" className="qr-icon" />
            </button>
            <button className="notif notif-btn" aria-label="Thông báo lệnh phạt" onClick={() => setNotifOpen(true)}>
              <span className="bell" />
              <span className="badge-count">3</span>
            </button>
          </div>
        </div>

        <div className="topbar-search-wrap">
          <div className="topbar-search">
            <input
              className="topbar-search-input"
              placeholder="Nhập biển số để tra cứu"
              aria-label="Nhập biển số để tra cứu"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitLookup();
                }
              }}
            />

            <div className="topbar-search-actions">
              <button
                className={`topbar-mic-btn${voiceListening ? " listening" : ""}`}
                type="button"
                onClick={toggleVoice}
                aria-label={voiceListening ? "Dừng ghi âm" : "Nhập bằng giọng nói"}
                title={speechSupported ? "Nhập bằng giọng nói" : "Trình duyệt chưa hỗ trợ voice"}
                disabled={!speechSupported}
              >
                <span className="mic-glyph" aria-hidden="true" />
              </button>

              <button className="topbar-search-btn" type="button" aria-label="Tra cứu biển số" onClick={submitLookup}>
                <span className="search-glyph" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="topbar-powered">Powered By HTX Minh Vy</div>
      </header>

      <QrScanModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onDetected={(value) => {
          setQrOpen(false);
          setQrResult(value);
          setResultOpen(true);
        }}
      />

      <ImageModal open={resultOpen} onClose={() => setResultOpen(false)} title="Kết quả quét QR">
        <div className="qr-result-text">{qrResult || "Không đọc được nội dung QR"}</div>
      </ImageModal>

      <ImageModal open={notifOpen} onClose={() => setNotifOpen(false)} title="Lệnh phạt (3)">
        <div className="fine-list">
          <div className="fine-item">
            <div className="fine-title">Phạt quá tốc độ - 50E57390</div>
            <div className="fine-meta">08:20 14/02/2026 - QL1A, TP.HCM</div>
            <div className="fine-amount">2.500.000d</div>
          </div>
          <div className="fine-item">
            <div className="fine-title">Phạt dừng đỗ sai quy định - 50E57390</div>
            <div className="fine-meta">17:45 10/02/2026 - Quận 1, TP.HCM</div>
            <div className="fine-amount">900.000d</div>
          </div>
          <div className="fine-item">
            <div className="fine-title">Phạt đi sai làn - 50E57390</div>
            <div className="fine-meta">09:05 03/02/2026 - Xa lộ Hà Nội</div>
            <div className="fine-amount">1.200.000d</div>
          </div>
        </div>
      </ImageModal>
    </>
  );
}

