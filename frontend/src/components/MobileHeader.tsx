import { useState } from "react";
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

const QR_ICON_URL = "https://www.svgrepo.com/show/490299/qr-code.svg";

export default function MobileHeader({ scrollDots: _scrollDots }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  function goHome() {
    if (location.pathname !== "/") {
      navigate("/", { state: { flyIn: true } });
    } else {
      window.dispatchEvent(new CustomEvent("home-fly-replay"));
    }
  }

  return (
    <>
      <header className="topbar">
        <button className="brand brand-btn" onClick={goHome} aria-label="Về trang chủ">
          <img src={asset("1.png")} alt="" className="brand-logo" />
          <div>
            <div className="brand-title">HTX Go</div>
            <div className="brand-sub">Quản lý giấy tờ và hồ sơ</div>
          </div>
        </button>
        <div className="topbar-right">
          <button className="icon-btn qr-icon-btn" aria-label="Quét QR" onClick={() => setQrOpen(true)}>
            <img src={QR_ICON_URL} alt="" className="qr-icon" />
          </button>
          <button className="notif notif-btn" aria-label="Thông báo lệnh phạt" onClick={() => setNotifOpen(true)}>
            <span className="bell" />
            <span className="badge-count">3</span>
          </button>
        </div>
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
