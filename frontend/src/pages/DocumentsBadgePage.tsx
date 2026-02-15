import { useEffect, useRef, useState } from "react";
import { asset } from "../assets";
import ImageModal from "../components/ImageModal";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function DocumentsBadgePage() {
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

      <section className="page-title">
        <h2>Phù hiệu</h2>
        <p>Thông tin phù hiệu & giấy xác nhận xã viên</p>
      </section>

      <section ref={sectionRefs[0]} className="hero-card insurance">
        <div className="hero-icon insurance-icon" />
        <div>
          <div className="hero-title">PHÙ HIỆU XE</div>
          <div className="hero-sub">Thông tin phù hiệu & giấy xác nhận xã viên</div>
        </div>
      </section>

      <section ref={sectionRefs[1]} className="info-card">
        <div className="info-head">
          <span className="info-icon">🛡️</span>
          <span>Thông tin phù hiệu xe</span>
        </div>
        <div className="info-row"><span>Số HĐ</span><strong>HD7926015983</strong></div>
        <div className="info-row"><span>HTX</span><strong>HTX MINH VY</strong></div>
        <div className="info-row"><span>Biển số xe</span><strong>50E57390</strong></div>
        <div className="info-row"><span>Hết hạn</span><strong>16/01/2033</strong></div>
      </section>

      <section className="info-card">
        <div className="info-head">
          <span className="info-icon">📄</span>
          <span>Giấy xác nhận xã viên</span>
        </div>
        <div className="info-row"><span>Ngày hết hạn</span><strong>16/01/2025</strong></div>
      </section>

      <button className="primary full" onClick={() => setPreviewOpen(true)}>
        Xem hình ảnh phù hiệu
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
