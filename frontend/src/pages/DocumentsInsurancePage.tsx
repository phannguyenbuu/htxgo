import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "../assets";
import ImageModal from "../components/ImageModal";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const insuranceItems = [
  { title: "BẢO HIỂM TNDS", expiry: "05/04/2025" },
  { title: "BẢO HIỂM VẬT CHẤT XE", expiry: "12/01/2024" },
  { title: "BẢO HIỂM Y TẾ", expiry: "31/12/2024" },
];

type InsuranceStatus = "Còn hạn" | "Sắp hết hạn" | "Hết hạn";

export default function DocumentsInsurancePage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const statuses = useMemo<InsuranceStatus[]>(() => {
    const pool: InsuranceStatus[] = ["Còn hạn", "Sắp hết hạn", "Hết hạn"];
    const result = insuranceItems.map((item) =>
      item.title === "BẢO HIỂM Y TẾ"
        ? "Còn hạn"
        : pool[Math.floor(Math.random() * pool.length)]
    );

    if (result.every((status) => status === "Còn hạn")) {
      const mutableIndexes = insuranceItems
        .map((item, idx) => (item.title === "BẢO HIỂM Y TẾ" ? -1 : idx))
        .filter((idx) => idx >= 0);
      const pickedIndex = mutableIndexes[Math.floor(Math.random() * mutableIndexes.length)];
      result[pickedIndex] = Math.random() < 0.5 ? "Sắp hết hạn" : "Hết hạn";
    }

    return result;
  }, []);
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
          <h2>Bảo hiểm</h2>
          <p>Danh sách bảo hiểm xe</p>
        </div>
        <div className="hotline-big">Hotline: 1900969690</div>
      </section>

      <section ref={sectionRefs[0]} className="info-card">
        <div className="info-head">
          <span className="info-icon">🛡️</span>
          <span>Tổng quan bảo hiểm</span>
        </div>
        <div className="info-row"><span>Số lượng bảo hiểm</span><strong>3</strong></div>
        <div className="info-row"><span>HTX</span><strong>HTX MINH VY</strong></div>
        <div className="info-row"><span>Biển số xe</span><strong>50E57390</strong></div>
      </section>

      <section ref={sectionRefs[1]} className="card-stack">
        {insuranceItems.map((item, idx) => {
          const status = statuses[idx];
          const statusClass =
            status === "Còn hạn"
              ? "ok"
              : status === "Sắp hết hạn"
                ? "warn"
                : "expired";

          return (
            <div key={item.title} className="doc-card insurance-card">
              <div className="doc-title">{item.title}</div>
              <div className="doc-meta">
                <span>Ngày hết hạn: {item.expiry}</span>
              </div>
              <div className="doc-meta">
                <span>
                  Trạng thái: <strong className={`badge ${statusClass}`}>{status}</strong>
                </span>
              </div>
              <div className="doc-actions">
                <button className="ghost-btn insurance-btn" onClick={() => setPreviewOpen(true)}>
                  Xem hình ảnh
                </button>
                {status !== "Còn hạn" && (
                  <button className="ghost-btn update-btn">Cập nhật ngay</button>
                )}
              </div>
            </div>
          );
        })}
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
