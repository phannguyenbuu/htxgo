import { clearToken } from "../api";
import { asset } from "../assets";

type ScrollDotsProps = {
  count: number;
  activeIndex: number;
};

type MobileHeaderProps = {
  scrollDots?: ScrollDotsProps;
};

export default function MobileHeader({ scrollDots }: MobileHeaderProps) {
  function logout() {
    clearToken();
    window.location.reload();
  }

  return (
    <header className="topbar">
      <div className="brand">
        <img src={asset("1.png")} alt="" className="brand-logo" />
        <div>
          <div className="brand-title">HTX Go</div>
          <div className="brand-sub">Quản lý giấy tờ và hồ sơ</div>
        </div>
      </div>
      <div className="topbar-right">
        {scrollDots && (
          <div className="scroll-dots" aria-label="Vị trí cuộn">
            {Array.from({ length: scrollDots.count }).map((_, idx) => (
              <span
                key={idx}
                className={idx === scrollDots.activeIndex ? "dot active" : "dot"}
              />
            ))}
          </div>
        )}
        <div className="notif">
          <span className="bell" />
          <span className="badge-count">3</span>
        </div>
        {!scrollDots && (
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
        )}
      </div>
    </header>
  );
}
