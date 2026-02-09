import { clearToken } from "../api";

export default function MobileHeader() {
  function logout() {
    clearToken();
    window.location.reload();
  }

  return (
    <header className="topbar">
      <div className="brand">
        <img src="/assets/1.png" alt="" className="brand-logo" />
        <div>
          <div className="brand-title">HTX Go</div>
          <div className="brand-sub">Quản lý giấy tờ và hồ sơ</div>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Tin nhắn">
          <span className="icon-dot" />
        </button>
        <button className="icon-btn" aria-label="Thông báo">
          <span className="icon-bell" />
        </button>
        <button className="icon-btn" onClick={logout} aria-label="Đăng xuất">
          <span className="icon-logout" />
        </button>
      </div>
    </header>
  );
}
