import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function VehiclesPage() {
  const [activeDot, setActiveDot] = useState(0);
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
          <span>Chủ & chi tiết xe</span>
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
          <div className="split-row">Ngày cấp: 16/04/2023</div>
          <div className="split-row">Ngày hết hạn: 16/10/2024</div>
        </div>
      </section>

      <section ref={sectionRefs[2]} className="vehicle-photo">
        <div className="photo-title">HÌNH ẢNH THỰC TẾ XE</div>
        <img src="/assets/car.jfif" alt="Xe" className="photo-img" />
      </section>

      <button className="primary full">Xem hình ảnh xe</button>

      <MobileTabs />
    </div>
  );
}
