import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const tabs = [
  {
    to: "/drivers",
    label: "Tài xế",
    sub: "Quản lý hồ sơ",
    icon: "/assets/2.png",
  },
  {
    to: "/vehicles",
    label: "Xe",
    sub: "Pháp lý xe",
    icon: "/assets/3.png",
  },
  {
    to: "/documents",
    label: "Giấy tờ",
    sub: "Phù hiệu, bảo hiểm",
    icon: "/assets/5.png",
  },
];

const moreItems = [
  { label: "Lệnh vận chuyển", icon: "/assets/4.png", to: "/more/transport" },
  { label: "Hộp đen định vị", icon: "/assets/6.png", to: "/more/tracker" },
  { label: "VETC", icon: "/assets/7.png", to: "/more/vetc" },
];

export default function MobileTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function go(to: string) {
    setOpen(false);
    navigate(to);
  }

  return (
    <>
      <div className="tabs">
        {tabs.map((t) => {
          const active = location.pathname === t.to;
          return (
            <Link key={t.to} to={t.to} className={active ? "tab active" : "tab"}>
              <img src={t.icon} alt="" className="tab-icon-img" />
              <div className="tab-text">
                <div className="tab-label">{t.label}</div>
                <div className="tab-sub">{t.sub}</div>
              </div>
            </Link>
          );
        })}

        <button className={open ? "tab active" : "tab"} onClick={() => setOpen(true)}>
          <div className="tab-ellipsis">...</div>
          <div className="tab-text">
            <div className="tab-label">Tùy chọn</div>
            <div className="tab-sub">Menu nhanh</div>
          </div>
        </button>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Tùy chọn nhanh</div>
            <div className="modal-list">
              {moreItems.map((item) => (
                <button key={item.label} className="modal-row" onClick={() => go(item.to)}>
                  <img src={item.icon} alt="" className="modal-row-icon" />
                  <div className="modal-row-text">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
