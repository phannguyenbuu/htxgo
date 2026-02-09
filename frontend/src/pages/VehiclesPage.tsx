import { useEffect, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";
import { api } from "../api";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    api.listVehicles().then(setVehicles).catch(() => setVehicles([]));
  }, []);

  return (
    <div className="app-shell">
      <MobileHeader />
      <section className="page-title">
        <h2>Xe</h2>
        <p>Pháp lý và trạng thái phương tiện</p>
      </section>

      <section className="list">
        {vehicles.map((v) => (
          <div key={v.id} className="list-card">
            <div className="list-title">{v.plate_number}</div>
            <div className="list-sub">Loại: {v.type || "-"}</div>
            <div className="list-meta">Tải trọng: {v.capacity || "-"}</div>
            <div className="list-meta">Đơn vị: {v.unit_id}</div>
            <div className="list-meta">Tài xế: {v.driver_id || "-"}</div>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
