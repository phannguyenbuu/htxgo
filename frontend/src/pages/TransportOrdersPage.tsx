import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const orders = [
  { code: "VC-2401", status: "Đang chạy", route: "Q1 → Q3 (TP.HCM)" },
  { code: "VC-2402", status: "Chờ duyệt", route: "Q5 → Q7 (TP.HCM)" },
  { code: "VC-2403", status: "Hoàn tất", route: "Thủ Đức → Bình Thạnh (TP.HCM)" },
];

export default function TransportOrdersPage() {
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
        <h2>Lệnh vận chuyển</h2>
        <p>Phạm vi nội thành TP.HCM</p>
      </section>

      <section ref={sectionRefs[0]} className="list">
        {orders.map((o) => (
          <div key={o.code} className="list-card">
            <div className="list-title">{o.code}</div>
            <div className="list-sub">Tuyến: {o.route}</div>
            <div className="list-meta">Trạng thái: {o.status}</div>
          </div>
        ))}
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">Tạo lệnh mới</div>
        <label>
          Mã lệnh
          <input placeholder="VC-2404" />
        </label>
        <label>
          Tuyến đường
          <input placeholder="Q10 → Q11 (TP.HCM)" />
        </label>
        <label>
          Ghi chú
          <textarea rows={3} placeholder="Nhập ghi chú vận chuyển" />
        </label>
        <button className="primary full">Tạo lệnh</button>
      </section>

      <MobileTabs />
    </div>
  );
}
