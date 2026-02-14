import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";
import ImageModal from "../components/ImageModal";
import { asset } from "../assets";

export default function DriversPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const sectionRefs = [
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
    useRef<HTMLElement | null>(null),
  ];

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
      { threshold: [0.1], rootMargin: "0px 0px 20% 0px" }
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

      <section className="page-title row">
        <div>
          <h2>Thông tin tài xế</h2>
          <p>Hồ sơ cá nhân & giấy tờ pháp lý</p>
        </div>
        <div className="header-actions">
          <button className="icon-action" aria-label="Tạo mới">
            <img src={asset("icon-add.svg")} alt="" />
          </button>
          <button className="icon-action" aria-label="Sửa">
            <img src={asset("icon-edit.svg")} alt="" />
          </button>
        </div>
      </section>

      <section className="search-bar">
        <label className="field">
          Tìm tài xế (tên, SĐT)
          <input placeholder="Nguyễn Văn A / 0909..." />
        </label>
        <label className="field">
          Hợp tác xã
          <select>
            <option>HTX1</option>
            <option>HTX2</option>
            <option>HTX3</option>
            <option>HTX4</option>
            <option>HTX5</option>
            <option>HTX-virtual</option>
          </select>
        </label>
      </section>

      <section ref={sectionRefs[0]} className="info-card">
        <div className="info-head">
          <span className="info-icon">👤</span>
          <span>Thông tin cá nhân</span>
        </div>
        <div className="info-row"><span>Họ và tên</span><strong>Nguyễn Văn Bình</strong></div>
        <div className="info-row"><span>Giới tính</span><strong>Nam</strong></div>
        <div className="info-row"><span>Ngày sinh</span><strong>15/08/1988</strong></div>
        <div className="info-row"><span>SĐT</span><strong>0987 654 321</strong></div>
        <div className="info-row"><span>Email</span><strong>nguyenvanbinh@gmail.com</strong></div>
        <div className="info-row"><span>Nơi thường trú</span><strong>123 Lê Văn Việt, TP Thủ Đức, TP.HCM</strong></div>
      </section>

      <section ref={sectionRefs[1]} className="info-card">
        <div className="info-head">
          <span className="info-icon">🪪</span>
          <span>Giấy tờ định danh</span>
        </div>
        <div className="info-row"><span>CCCD</span><strong>079070123456</strong></div>
        <div className="info-row"><span>CMND</span><strong>123456789</strong></div>
        <div className="info-row"><span>Ngày cấp</span><strong>20/06/2021</strong></div>
        <div className="info-row"><span>Tình trạng</span><strong className="badge ok">Còn hiệu lực</strong></div>
      </section>

      <section className="info-card">
        <div className="info-head">
          <span className="info-icon">🚗</span>
          <span>Bằng lái xe</span>
        </div>
        <div className="info-row"><span>Hạng</span><strong>B2</strong></div>
        <div className="info-row"><span>Ngày cấp</span><strong>12/03/2021</strong></div>
        <div className="info-row"><span>Ngày hết hạn</span><strong>12/03/2026</strong></div>
        <div className="info-row"><span>Tình trạng</span><strong className="badge warn">Sắp hết hạn</strong></div>
      </section>

      <section className="card-stack">
        <div className="doc-card">
          <div className="doc-title">GIẤY KHÁM SỨC KHỎE</div>
          <div className="doc-meta">
            <span>Ngày cấp: 03/05/2023</span>
            <span>Hết hạn: 03/05/2025</span>
          </div>
          <button className="ghost-btn" onClick={() => setPreviewOpen(true)}>
            Xem hình ảnh
          </button>
        </div>
        <div className="doc-card">
          <div className="doc-title">LÝ LỊCH TƯ PHÁP</div>
          <div className="doc-meta">
            <span>Ngày cấp: 10/02/2022</span>
            <span>Hết hạn: 10/02/2024</span>
          </div>
          <button className="ghost-btn" onClick={() => setPreviewOpen(true)}>
            Xem hình ảnh
          </button>
        </div>
        <div className="doc-card">
          <div className="doc-title">KẾT QUẢ XÉT NGHIỆM</div>
          <div className="doc-meta">
            <span>Ngày cấp: 12/06/2023</span>
            <span>Hết hạn: 12/06/2025</span>
          </div>
          <button className="ghost-btn" onClick={() => setPreviewOpen(true)}>
            Xem hình ảnh
          </button>
        </div>
      </section>

      <button className="primary full" onClick={() => setPreviewOpen(true)}>
        Xem hình ảnh hồ sơ
      </button>
      <div ref={sectionRefs[2]} className="scroll-sentinel" />

      <MobileTabs />

      <ImageModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={asset("e0269081ce8b40d5199a.jpg")}
      />
    </div>
  );
}
