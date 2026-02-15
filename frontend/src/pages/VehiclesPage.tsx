import { useEffect, useRef, useState } from "react";
import { asset } from "../assets";
import ImageModal from "../components/ImageModal";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function VehiclesPage() {
  const [activeDot, setActiveDot] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const galleryImages = [
    asset("car1.jpg"),
    asset("car2.jpg"),
    asset("car3.jpg"),
    asset("car4.jpg"),
    asset("car5.jpg"),
    asset("car6.jpg"),
    asset("car7.jpg"),
    asset("car8.jpg"),
    asset("car9.jpg"),
    asset("car10.jpg"),
  ];
  const documentImages = [
    asset("e0269081ce8b40d5199a.jpg"),
    asset("e0269081ce8b40d5199a.jpg"),
    asset("e0269081ce8b40d5199a.jpg"),
    asset("e0269081ce8b40d5199a.jpg"),
    asset("e0269081ce8b40d5199a.jpg"),
  ];
  const [currentImage, setCurrentImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(asset("car.jfif"));
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewTitle, setPreviewTitle] = useState("Xem hình ảnh xe");
  const sectionRefs = [useRef<HTMLElement | null>(null), useRef<HTMLElement | null>(null), useRef<HTMLElement | null>(null)];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const index = Number(visible[0].target.getAttribute("data-index"));
          if (!Number.isNaN(index)) {
            setActiveDot(index);
          }
        }
      },
      { threshold: [0.2, 0.4, 0.6] }
    );

    sectionRefs.forEach((ref, idx) => {
      if (ref.current) {
        ref.current.setAttribute("data-index", String(idx));
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [sectionRefs]);

  return (
    <div className="app-shell">
      <MobileHeader scrollDots={{ count: 3, activeIndex: activeDot }} />

      <section className="page-title">
        <h2>Thông tin xe</h2>
        <p>Hồ sơ pháp lý & giấy tờ phương tiện</p>
      </section>

      <section ref={sectionRefs[0]} className="info-card">
        <div className="info-head">
          <span className="info-icon">🚙</span>
          <span>Thông tin chủ xe</span>
        </div>
        <div className="info-row"><span>Tên chủ xe</span><strong>Nguyễn Văn Bình</strong></div>
        <div className="info-row"><span>Địa chỉ</span><strong>123 Lê Văn Việt, TP Thủ Đức, TP.HCM</strong></div>
        <div className="info-row"><span>Nhãn hiệu</span><strong>HYUNDAI</strong></div>
        <div className="info-row"><span>Loại xe</span><strong>Ô tô tải</strong></div>
        <div className="info-row"><span>Số máy</span><strong>D4CB9U123456</strong></div>
        <div className="info-row"><span>Số khung</span><strong>KMFTCB1MPUXXXXXX</strong></div>
        <div className="info-row"><span>Biển số đăng ký</span><strong>58C-95.960</strong></div>
        <div className="info-row"><span>Ngày cấp</span><strong>20/06/2020</strong></div>
      </section>

      <section ref={sectionRefs[1]} className="split-grid">
        <div className="split-card">
          <div className="split-title">Giấy tờ mua bán</div>
          <div className="split-row">Giấy ngân hàng</div>
          <div className="split-row">Hợp đồng mua bán</div>
        </div>
        <div className="split-card">
          <div className="split-title">Kiểm định xe</div>
          <div className="split-row">Trạng thái: <strong>Còn hạn</strong></div>
          <div className="split-row">Ngày cấp: 16/10/2025</div>
          <div className="split-row">Ngày hết hạn: 16/10/2026</div>
        </div>
      </section>

      <section className="form-card">
        <div className="form-title">LỊCH SỬ BẢO DƯỠNG XE</div>
        <div className="list-row"><strong>Bảo dưỡng gần nhất</strong></div>
        <div className="list-row">Ngày bảo dưỡng: 15/12/2025</div>
        <div className="list-row">Số km: 52.300 km</div>
        <div className="list-row">Gara thực hiện: Gara Minh Phát - Q. Tân Bình</div>
      </section>

      <section className="form-card">
        <div className="form-title">HẠNG MỤC ĐÃ THỰC HIỆN</div>
        <div className="list-row">✅ Thay nhớt</div>
        <div className="list-row">✅ Thay lọc nhớt / lọc gió</div>
        <div className="list-row">✅ Bảo dưỡng định kỳ</div>
        <div className="list-row">✅ Sửa chữa phát sinh</div>
      </section>

      <section className="form-card">
        <div className="form-title">THÔNG TIN CHI TIẾT</div>
        <div className="list-row">Số km lúc bảo dưỡng: 52.300 km</div>
        <div className="list-row">Gara thực hiện: Gara Minh Phát</div>
        <div className="list-row">Ghi chú: Xe hoạt động bình thường, thay nhớt và lọc gió theo định kỳ</div>
      </section>

      <section className="quick-actions">
        <button className="primary" onClick={() => setHistoryOpen(true)}>
          Xem lịch sử
        </button>
        <button
          className="primary"
          onClick={() => {
            setPreviewTitle("Xem giấy tờ bảo dưỡng");
            setPreviewSrc(asset("giayto_bd.jpg"));
            setPreviewImages([]);
            setPreviewOpen(true);
          }}
        >
          Xem giấy tờ
        </button>
      </section>

      <section ref={sectionRefs[2]} className="vehicle-photo">
        <div className="photo-title">HÌNH ẢNH THỰC TẾ XE</div>
        <div className="photo-gallery">
          <button
            className="gallery-nav prev"
            aria-label="Ảnh trước"
            onClick={() =>
              setCurrentImage((idx) => (idx - 1 + galleryImages.length) % galleryImages.length)
            }
          >
            ‹
          </button>
          <img src={galleryImages[currentImage]} alt={`Xe ${currentImage + 1}`} className="photo-img" />
          <button
            className="gallery-nav next"
            aria-label="Ảnh sau"
            onClick={() => setCurrentImage((idx) => (idx + 1) % galleryImages.length)}
          >
            ›
          </button>
        </div>
      </section>

      <button
        className="primary full"
        onClick={() => {
          setPreviewTitle("Xem giấy tờ xe");
          setPreviewSrc(documentImages[0]);
          setPreviewImages(documentImages);
          setPreviewOpen(true);
        }}
      >
        Xem giấy tờ xe
      </button>

      <MobileTabs />

      <ImageModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        src={previewSrc}
        images={previewImages}
      />

      <ImageModal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Lịch sử các lần bảo dưỡng">
        <div className="list" style={{ width: "100%" }}>
          <div className="list-card">
            <div className="list-title">Lần 1 - 15/12/2025</div>
            <div className="list-sub">Số km: 52.300 km</div>
            <div className="list-meta">Gara Minh Phát - Q. Tân Bình</div>
          </div>
          <div className="list-card">
            <div className="list-title">Lần 2 - 10/06/2025</div>
            <div className="list-sub">Số km: 45.100 km</div>
            <div className="list-meta">Gara Minh Phát</div>
          </div>
          <div className="list-card">
            <div className="list-title">Lần 3 - 05/01/2025</div>
            <div className="list-sub">Số km: 37.800 km</div>
            <div className="list-meta">Gara Tân Sơn</div>
          </div>
        </div>
      </ImageModal>
    </div>
  );
}
