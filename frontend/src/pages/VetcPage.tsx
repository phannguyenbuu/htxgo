import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

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
        <h2>THẺ DÁN VETC</h2>
        <p>Thông tin thẻ và phương tiện</p>
      </section>

      <section ref={sectionRefs[0]} className="info-card">
        <div className="info-head">
          <span className="info-icon">💳</span>
          <span>THÔNG TIN THẺ</span>
        </div>
        <div className="info-row"><span>Số thẻ</span><strong>8703 9865 ZF74 1234</strong></div>
        <div className="info-row"><span>Nhà cung cấp</span><strong>VETC</strong></div>
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">THÔNG TIN XE</div>
        <div className="list-row">Biển số xe: 50E57390</div>
        <div className="list-row">Loại xe: Ô tô con</div>
        <div className="list-row">HTX quản lý: HTX MINH VY</div>
      </section>

      <section className="form-card">
        <div className="form-title">THỜI HẠN</div>
        <div className="list-row">Ngày dán thẻ: 20/06/2020</div>
        <div className="list-row">Ngày hết hạn: 01/07/2030</div>
      </section>

      <button className="primary full">XEM HÌNH ẢNH</button>

      <MobileTabs />
    </div>
  );
}
