import { ReactNode, useEffect, useMemo, useState } from "react";

type ImageModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  src?: string;
  images?: string[];
  children?: ReactNode;
  compact?: boolean;
  closeLabel?: string;
};

export default function ImageModal({
  open,
  onClose,
  title,
  src,
  images,
  children,
  compact = true,
  closeLabel = "OK",
}: ImageModalProps) {
  const gallery = useMemo(() => {
    if (images && images.length) return images;
    if (src) return [src];
    return [] as string[];
  }, [images, src]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(0);
  }, [open, gallery]);

  if (!open) return null;

  return (
    <div className="image-modal-backdrop" onClick={onClose}>
      <div className={compact ? "image-modal image-modal-compact" : "image-modal"} onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <div className="image-modal-title">{title || "Xem hình ảnh"}</div>
          <button className="image-modal-close" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        <div className="image-modal-body">
          {children ? (
            children
          ) : (
            <>
              {gallery.length > 1 && (
                <button
                  className="gallery-nav prev"
                  aria-label="Ảnh trước"
                  onClick={() => setCurrentIndex((idx) => (idx - 1 + gallery.length) % gallery.length)}
                >
                  ‹
                </button>
              )}
              {gallery.length > 0 && <img src={gallery[currentIndex]} alt="Xem ảnh" />}
              {gallery.length > 1 && (
                <button
                  className="gallery-nav next"
                  aria-label="Ảnh sau"
                  onClick={() => setCurrentIndex((idx) => (idx + 1) % gallery.length)}
                >
                  ›
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
