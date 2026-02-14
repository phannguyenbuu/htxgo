import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";
import ImageModal from "../components/ImageModal";
import { asset } from "../assets";

const docs = [
  {
    title: "GIẤY KHÁM SỨC KHỎE",
    issued: "03/05/2023",
    expiry: "03/05/2025",
  },
  {
    title: "LÝ LỊCH TƯ PHÁP",
    issued: "10/02/2022",
    expiry: "10/02/2024",
  },
  {
    title: "KẾT QUẢ XÉT NGHIỆM",
    issued: "12/06/2023",
    expiry: "12/06/2025",
  },
];

export default function DashboardPage() {
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

      <section ref={sectionRefs[0]} className="hero-card">
        <div className="hero-icon" />
        <div>
          <div className="hero-title">LLTP KHÁM SỨC KHỎE</div>
          <div className="hero-sub">Hồ sơ y tế và lý lịch tư pháp</div>
        </div>
      </section>

      <section ref={sectionRefs[1]} className="card-stack">
        {docs.map((d) => (
          <div key={d.title} className="doc-card">
            <div className="doc-title">{d.title}</div>
            <div className="doc-meta">
              <span>Ngày cấp: {d.issued}</span>
              <span>Hết hạn: {d.expiry}</span>
            </div>
            <button className="ghost-btn" onClick={() => setPreviewOpen(true)}>
              Xem hình ảnh
            </button>
          </div>
        ))}
      </section>

      <section className="quick-actions">
        <button className="primary">Đăng ký HTX</button>
        <button className="outline">Hotline</button>
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
