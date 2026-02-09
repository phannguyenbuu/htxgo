import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const insuranceItems = [
  { title: "BẢO HIỂM TNDS", expiry: "05/04/2025" },
  { title: "BẢO HIỂM VẬT CHẤT XE", expiry: "12/01/2024" },
  { title: "BẢO HIỂM Y TẾ", expiry: "31/12/2024" },
];

export default function DocumentsPage() {
  return (
    <div className="app-shell">
      <MobileHeader />

      <section className="page-title">
        <h2>Bảo hiểm</h2>
        <p>Thông tin phù hiệu & giấy xác nhận xã viên</p>
      </section>

      <section className="hero-card insurance">
        <div className="hero-icon insurance-icon" />
        <div>
          <div className="hero-title">BẢO HIỂM TNDS</div>
          <div className="hero-sub">Thông tin phù hiệu xe</div>
        </div>
      </section>

      <section className="card-stack">
        {insuranceItems.map((item) => (
          <div key={item.title} className="doc-card insurance-card">
            <div className="doc-title">{item.title}</div>
            <div className="doc-meta">
              <span>Ngày hết hạn: {item.expiry}</span>
            </div>
            <button className="ghost-btn insurance-btn">Xem hình ảnh</button>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
