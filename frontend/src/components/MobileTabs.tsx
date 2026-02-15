import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { asset } from "../assets";

const tabs = [
  {
    to: "/drivers",
    label: "Tài xế",
    sub: "Quản lý HS",
    icon: asset("2.png"),
  },
  {
    to: "/vehicles",
    label: "Xe",
    sub: "Pháp lý xe",
    icon: asset("3.png"),
  },
  {
    to: "/documents",
    label: "Giấy tờ",
    sub: "Phù hiệu, bảo hiểm",
    icon: asset("5.png"),
  },
];

const moreItems = [
  { label: "Lệnh vận chuyển", icon: asset("4.png"), to: "/more/transport" },
  { label: "Tra cứu phạt nguội", icon: asset("8.png"), to: "/more/phat-nguoi" },
  { label: "VETC", icon: asset("7.png"), to: "/more/vetc" },
  { label: "Liên hệ", icon: asset("more-contact.svg"), to: "/more/contact" },
];

export default function MobileTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  function go(to: string) {
    setOpen(false);
    setDocsOpen(false);
    navigate(to);
  }

  return (
    <>
      <div className="tabs">
        {tabs.map((t) => {
          const active = t.to === "/documents"
            ? location.pathname.startsWith("/documents")
            : location.pathname === t.to;

          if (t.to === "/documents") {
            return (
              <button key={t.to} className={active ? "tab active" : "tab"} onClick={() => setDocsOpen(true)}>
                <img src={t.icon} alt="" className="tab-icon-img" />
                <div className="tab-text">
                  <div className="tab-label">{t.label}</div>
                  <div className="tab-sub">{t.sub}</div>
                </div>
              </button>
            );
          }

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
            <div className="tab-label">Dịch vụ khác</div>
          </div>
        </button>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Tùy chọn nhanh</div>
              <button className="close-circle-btn" onClick={() => setOpen(false)} aria-label="Đóng tùy chọn">
                <span className="close-line" />
                <span className="close-line close-line-2" />
              </button>
            </div>
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

      {docsOpen && (
        <div className="modal-backdrop" onClick={() => setDocsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Giấy tờ xe + bảo hiểm</div>
              <button className="close-circle-btn" onClick={() => setDocsOpen(false)} aria-label="Đóng giấy tờ">
                <span className="close-line" />
                <span className="close-line close-line-2" />
              </button>
            </div>
            <div className="modal-grid">
              <button className="modal-card" onClick={() => go("/documents/phu-hieu")}>
                <img src={asset("5.png")} alt="" className="modal-icon" />
                <div className="modal-label">Phù hiệu</div>
              </button>
              <button className="modal-card" onClick={() => go("/documents/bao-hiem")}>
                <img src={asset("tab-insurance.svg")} alt="" className="modal-icon" />
                <div className="modal-label">Bảo hiểm</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
