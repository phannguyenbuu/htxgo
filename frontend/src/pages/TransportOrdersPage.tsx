import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const orders = [
  { code: "VC-2401", route: "[Vận chuyển] Bình Tân > Cần Giờ", price: "132.192" },
  { code: "VC-2402", route: "[Vận chuyển] Gò Vấp > Bình Tân", price: "31.400" },
  { code: "VC-2403", route: "[Vận chuyển] Quận 3 > Phú Nhuận", price: "14.148" },
  { code: "VC-2404", route: "[Vận chuyển] Quận 12 > Thuận An", price: "33.300 + 9.259" },
];

export default function TransportOrdersPage() {
  const [activeDot, setActiveDot] = useState(0);
  const sectionRefs = [useRef<HTMLElement | null>(null)];

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
      <MobileHeader scrollDots={{ count: 1, activeIndex: activeDot }} />
      <section className="page-title">
        <h2>Lệnh vận chuyển</h2>
        <p>Phạm vi nội thành TP.HCM</p>
      </section>

      <section ref={sectionRefs[0]} className="list">
        {orders.map((o) => (
          <div key={o.code} className="list-card">
            <div className="list-title">{o.route}</div>
            <div className="list-sub">Giá {o.price} Nhận đơn ngay!</div>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
