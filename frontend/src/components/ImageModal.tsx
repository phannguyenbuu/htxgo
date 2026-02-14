import { ReactNode } from "react";

export default function ImageModal({
  open,
  onClose,
  title,
  src,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  src: string;
}) {
  if (!open) return null;

  return (
    <div className="image-modal-backdrop" onClick={onClose}>
      <div className="image-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <div className="image-modal-title">{title || "Xem hình ảnh"}</div>
          <button className="image-modal-close" onClick={onClose}>
            Đóng
          </button>
        </div>
        <div className="image-modal-body">
          <img src={src} alt="Xem ảnh" />
        </div>
      </div>
    </div>
  );
}
