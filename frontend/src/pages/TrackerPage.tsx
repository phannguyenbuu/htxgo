import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const devices = [
  { id: "HB-901", plate: "29A-12345", status: "Đang hoạt động" },
  { id: "HB-902", plate: "43B-55678", status: "Mất tín hiệu" },
  { id: "HB-903", plate: "51C-90876", status: "Bảo trì" },
];

export default function TrackerPage() {
  return (
    <div className="app-shell">
      <MobileHeader />
      <section className="page-title">
        <h2>Hộp đen định vị</h2>
        <p>Thiết bị định vị theo phương tiện</p>
      </section>

      <section className="list">
        {devices.map((d) => (
          <div key={d.id} className="list-card">
            <div className="list-title">{d.id}</div>
            <div className="list-sub">Xe: {d.plate}</div>
            <div className="list-meta">Trạng thái: {d.status}</div>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
