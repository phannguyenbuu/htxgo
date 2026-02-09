import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const orders = [
  { code: "VC-2401", status: "Đang chạy", route: "Hà Nội → Hải Phòng" },
  { code: "VC-2402", status: "Chờ duyệt", route: "Đà Nẵng → Huế" },
  { code: "VC-2403", status: "Hoàn tất", route: "TP.HCM → Bình Dương" },
];

export default function TransportOrdersPage() {
  return (
    <div className="app-shell">
      <MobileHeader />
      <section className="page-title">
        <h2>Lệnh vận chuyển</h2>
        <p>Danh sách lệnh và trạng thái thực hiện</p>
      </section>

      <section className="list">
        {orders.map((o) => (
          <div key={o.code} className="list-card">
            <div className="list-title">{o.code}</div>
            <div className="list-sub">Tuyến: {o.route}</div>
            <div className="list-meta">Trạng thái: {o.status}</div>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
