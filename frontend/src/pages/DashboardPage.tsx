import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

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
  return (
    <div className="app-shell">
      <MobileHeader />

      <section className="hero-card">
        <div className="hero-icon" />
        <div>
          <div className="hero-title">LLTP KHÁM SỨC KHỎE</div>
          <div className="hero-sub">Hồ sơ y tế và lý lịch tư pháp</div>
        </div>
      </section>

      <section className="card-stack">
        {docs.map((d) => (
          <div key={d.title} className="doc-card">
            <div className="doc-title">{d.title}</div>
            <div className="doc-meta">
              <span>Ngày cấp: {d.issued}</span>
              <span>Hết hạn: {d.expiry}</span>
            </div>
            <button className="ghost-btn">Xem hình ảnh</button>
          </div>
        ))}
      </section>

      <section className="quick-actions">
        <button className="primary">Đăng ký HTX</button>
        <button className="outline">Hotline</button>
      </section>

      <MobileTabs />
    </div>
  );
}
