import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const vetcItems = [
  { plate: "30F-11223", balance: "1.250.000đ", status: "Đang sử dụng" },
  { plate: "51G-55688", balance: "320.000đ", status: "Cần nạp" },
  { plate: "43A-77889", balance: "0đ", status: "Khóa" },
];

export default function VetcPage() {
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
        <h2>VETC</h2>
        <p>Thông tin tài khoản thu phí</p>
      </section>

      <section ref={sectionRefs[0]} className="list">
        {vetcItems.map((v) => (
          <div key={v.plate} className="list-card">
            <div className="list-title">{v.plate}</div>
            <div className="list-sub">Số dư: {v.balance}</div>
            <div className="list-meta">Trạng thái: {v.status}</div>
          </div>
        ))}
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">Cập nhật tài khoản</div>
        <label>
          Biển số xe
          <input placeholder="30F-11223" />
        </label>
        <label>
          Số dư mới
          <input placeholder="500.000đ" />
        </label>
        <label>
          Ghi chú
          <textarea rows={3} placeholder="Lý do cập nhật" />
        </label>
        <button className="primary full">Cập nhật</button>
      </section>

      <MobileTabs />
    </div>
  );
}
