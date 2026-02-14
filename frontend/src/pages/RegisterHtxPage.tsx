import { useEffect, useRef, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function RegisterHtxPage() {
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
        <h2>Đăng ký thêm HTX</h2>
        <p>Khởi tạo hồ sơ hợp tác xã mới</p>
      </section>

      <section ref={sectionRefs[0]} className="form-card">
        <div className="form-title">Thông tin HTX</div>
        <label>
          Tên HTX
          <input placeholder="HTX Vận tải An Bình" />
        </label>
        <label>
          Mã số thuế
          <input placeholder="0109999999" />
        </label>
        <label>
          Địa chỉ
          <input placeholder="Quận 1, TP.HCM" />
        </label>
      </section>

      <section ref={sectionRefs[1]} className="form-card">
        <div className="form-title">Người đại diện</div>
        <label>
          Họ và tên
          <input placeholder="Nguyễn Văn A" />
        </label>
        <label>
          SĐT
          <input placeholder="0909 111 222" />
        </label>
        <label>
          Email
          <input placeholder="contact@htx.vn" />
        </label>
        <button className="primary full">Gửi đăng ký</button>
      </section>

      <MobileTabs />
    </div>
  );
}
