import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
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

type AppNotification = {
  id: number;
  title: string;
  message: string;
  created_at?: string | null;
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const items = await api.listMyNotifications();
        if (!ignore) {
          setNotifications(Array.isArray(items) ? items : []);
        }
      } catch {
        if (!ignore) {
          setNotifications([]);
        }
      }
    })();
    return () => {
      ignore = true;
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
            <button className="notif notif-btn" aria-label="Thông báo" onClick={() => setNotifOpen(true)}>
              <span className="bell" />
              {notifications.length > 0 && <span className="badge-count">{notifications.length}</span>}
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

      <ImageModal open={notifOpen} onClose={() => setNotifOpen(false)} title={`Thông báo (${notifications.length})`}>
        <div className="fine-list">
          {notifications.length === 0 ? (
            <div className="fine-item">
              <div className="fine-title">Chưa có thông báo</div>
              <div className="fine-meta">Khi admin gửi thông báo, mục này sẽ tự cập nhật.</div>
            </div>
          ) : (
            notifications.map((item) => (
              <div className="fine-item" key={item.id}>
                <div className="fine-title">{item.title}</div>
                <div className="fine-meta">{item.created_at || "Vừa xong"}</div>
                <div className="fine-amount">{item.message}</div>
              </div>
            ))
          )}
        </div>
      </ImageModal>
    </>
  );
}
