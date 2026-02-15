import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function ContactPage() {
  const [activeDot, setActiveDot] = useState(0);
  const sectionRefs = [useRef<HTMLElement | null>(null), useRef<HTMLElement | null>(null)];

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
      { threshold: [0.3, 0.6] }
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
      <MobileHeader scrollDots={{ count: 2, activeIndex: activeDot }} />
      <section className="page-title">
        <h2>Liên hệ</h2>
        <p>Thông tin hỗ trợ và phản hồi</p>
      </section>

      <section ref={sectionRefs[0]} className="form-card">
        <div className="form-title">Gửi phản hồi</div>
        <label>
          Họ và tên
          <input placeholder="Nguyễn Văn B" />
        </label>
        <label>
          Email
          <input placeholder="ban@example.com" />
        </label>
        <label>
          Số điện thoại liên hệ
          <input placeholder="09xx xxx xxx" />
        </label>
        <label>
          Nội dung
          <textarea rows={3} placeholder="Nội dung phản hồi" />
        </label>
        <button className="primary full">Gửi phản hồi</button>
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">Thông tin liên hệ</div>
        <div className="list-row">📞 THÔNG TIN LIÊN HỆ HỖ TRỢ</div>
        <div className="list-row">🏢 HTX Minh Vy – Thanh Vy – Kim Thịnh – Nghĩa Phát</div>
        <div className="list-row">📍 Địa chỉ: Số 09, Đường số 07, KDC Cityland, P. Gò Vấp, TP.HCM</div>
        <div className="list-row">☎️ Hotline:</div>
        <div className="list-row">📱 0948.091.091</div>
        <div className="list-row">📱 0902.57.1972</div>
        <div className="list-row">📱 0793.911.911</div>
        <div className="list-row">📱 0777.222.6333</div>
        <div className="list-row">☎️ 028.36.116.117</div>
      </section>

      <MobileTabs />
    </div>
  );
}
