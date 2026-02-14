import { useEffect, useRef } from "react";

export default function QrScanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        // ignore for demo
      }
    }

    if (open) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="image-modal-backdrop" onClick={onClose}>
      <div className="image-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <div className="image-modal-title">Kiểm tra quét mã</div>
          <button className="image-modal-close" onClick={onClose}>
            Đóng
          </button>
        </div>
        <div className="qr-modal-body">
          <video ref={videoRef} className="qr-video" playsInline />
          <div className="qr-hint">Đưa mã QR vào khung để quét</div>
          <div className="qr-frame" />
        </div>
      </div>
    </div>
  );
}
