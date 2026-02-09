import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

const vetcItems = [
  { plate: "30F-11223", balance: "1.250.000đ", status: "Đang sử dụng" },
  { plate: "51G-55688", balance: "320.000đ", status: "Cần nạp" },
  { plate: "43A-77889", balance: "0đ", status: "Khóa" },
];

export default function VetcPage() {
  return (
    <div className="app-shell">
      <MobileHeader />
      <section className="page-title">
        <h2>VETC</h2>
        <p>Thông tin tài khoản thu phí</p>
      </section>

      <section className="list">
        {vetcItems.map((v) => (
          <div key={v.plate} className="list-card">
            <div className="list-title">{v.plate}</div>
            <div className="list-sub">Số dư: {v.balance}</div>
            <div className="list-meta">Trạng thái: {v.status}</div>
          </div>
        ))}
      </section>

      <MobileTabs />
    </div>
  );
}
