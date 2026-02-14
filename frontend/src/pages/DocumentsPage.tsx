import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";
import ImageModal from "../components/ImageModal";
import { asset } from "../assets";

const insuranceItems = [
  { title: "BẢO HIỂM TNDS", expiry: "05/04/2025" },
  { title: "BẢO HIỂM VẬT CHẤT XE", expiry: "12/01/2024" },
  { title: "BẢO HIỂM Y TẾ", expiry: "31/12/2024" },
];

export default function DocumentsPage() {
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
        <h2>Bảo hiểm</h2>
        <p>Thông tin phù hiệu & giấy xác nhận xã viên</p>
      </section>

      <section className="search-bar">
        <label className="field">
          Tìm giấy tờ (tên, loại, số)
          <input placeholder="Bảo hiểm / Phù hiệu / HD..." />
        </label>
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
        <div className="info-row"><span>Đơn vị</span><strong>HTX MINH VY</strong></div>
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

      <section className="card-stack">
        {insuranceItems.map((item) => (
          <div key={item.title} className="doc-card insurance-card">
            <div className="doc-title">{item.title}</div>
            <div className="doc-meta">
              <span>Ngày hết hạn: {item.expiry}</span>
            </div>
            <button className="ghost-btn insurance-btn" onClick={() => setPreviewOpen(true)}>
              Xem hình ảnh
            </button>
          </div>
        ))}
      </section>
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
