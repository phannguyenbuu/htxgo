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
          Nội dung
          <textarea rows={3} placeholder="Nội dung phản hồi" />
        </label>
        <button className="primary full">Gửi phản hồi</button>
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">Thông tin liên hệ</div>
        <div className="list-row">Email: support@htxgo.vn</div>
        <div className="list-row">Địa chỉ: Hà Nội, Việt Nam</div>
        <div className="list-row">Giờ làm việc: 8:00 - 18:00</div>
      </section>

      <MobileTabs />
    </div>
  );
}
