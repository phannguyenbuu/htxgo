import { useEffect, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";
import { api } from "../api";

const driverDocs = [
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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    api.listDrivers().then(setDrivers).catch(() => setDrivers([]));
  }, []);

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
        {driverDocs.map((d) => (
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

      <section className="list">
        {drivers.map((d) => (
          <div key={d.id} className="list-card">
            <div className="list-title">{d.full_name}</div>
            <div className="list-sub">Bằng lái: {d.license_number || "-"}</div>
            <div className="list-meta">SĐT: {d.phone || "-"}</div>
            <div className="list-meta">Đơn vị: {d.unit_id}</div>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
