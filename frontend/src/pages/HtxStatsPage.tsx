import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const stats = [
  { htx: "HTX1", drivers: 32, vehicles: 18, docs: 74 },
  { htx: "HTX2", drivers: 24, vehicles: 15, docs: 60 },
  { htx: "HTX3", drivers: 18, vehicles: 10, docs: 45 },
  { htx: "HTX4", drivers: 27, vehicles: 14, docs: 52 },
  { htx: "HTX5", drivers: 12, vehicles: 8, docs: 29 },
];

export default function HtxStatsPage() {
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
        <h2>Thống kê theo HTX</h2>
        <p>Tổng hợp tài xế, xe và giấy tờ</p>
      </section>

      <section ref={sectionRefs[0]} className="list">
        {stats.map((s) => (
          <div key={s.htx} className="list-card">
            <div className="list-title">{s.htx}</div>
            <div className="list-sub">Tài xế: {s.drivers}</div>
            <div className="list-meta">Xe: {s.vehicles} • Giấy tờ: {s.docs}</div>
          </div>
        ))}
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">Bộ lọc thống kê</div>
        <label>
          HTX
          <input placeholder="HTX1" />
        </label>
        <label>
          Khoảng thời gian
          <input placeholder="01/01/2025 - 31/12/2025" />
        </label>
        <button className="primary full">Áp dụng</button>
      </section>

      <MobileTabs />
    </div>
  );
}
