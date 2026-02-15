import { useEffect, useRef } from "react";
import ImageModal from "./ImageModal";

type QrScanModalProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
};

export default function QrScanModal({ open, onClose, onDetected }: QrScanModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let scanTimer: number | null = null;
    let finished = false;

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

        const BarcodeDetectorCtor = (window as any).BarcodeDetector;
        if (!BarcodeDetectorCtor) {
          return;
        }

        const detector = new BarcodeDetectorCtor({
          formats: ["qr_code"],
        });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        scanTimer = window.setInterval(async () => {
          if (finished || !videoRef.current) return;
          const video = videoRef.current;
          if (video.videoWidth === 0 || video.videoHeight === 0) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const codes = await detector.detect(canvas);
            if (codes.length > 0 && codes[0].rawValue) {
              finished = true;
              onDetected(codes[0].rawValue);
            }
          } catch {
            // ignore detect errors
          }
        }, 500);
      } catch {
        // ignore for demo
      }
    }

    if (open) {
      startCamera();
    }

    return () => {
      finished = true;
      if (scanTimer) {
        window.clearInterval(scanTimer);
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open, onDetected]);

  return (
    <ImageModal open={open} onClose={onClose} title="Kiểm tra quét mã" closeLabel="Đóng" compact={false}>
      <div className="qr-modal-body">
        <video ref={videoRef} className="qr-video" playsInline />
        <div className="qr-hint">Đưa mã QR vào khung để quét</div>
        <div className="qr-frame" />
      </div>
    </ImageModal>
  );
}
