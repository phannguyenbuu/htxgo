import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MobileHeader from "../components/MobileHeader";
import { asset } from "../assets";

const primaryCards = [
  { to: "/drivers", title: "Tài xế", sub: "Quản lý hồ sơ", image: asset("2.png") },
  { to: "/vehicles", title: "Xe", sub: "Pháp lý xe", image: asset("3.png") },
];

const serviceCards = [
  { to: "/more/transport", title: "Lệnh vận chuyển", image: asset("4.png") },
  { to: "/documents/phu-hieu", title: "Phù hiệu", image: asset("5.png") },
  { to: "/documents/bao-hiem", title: "Bảo hiểm", image: asset("tab-insurance.svg") },
  { to: "/more/phat-nguoi", title: "Phạt nguội", image: asset("8.png") },
  { to: "/more/vetc", title: "VETC", image: asset("7.png") },
  { to: "/more/contact", title: "Liên hệ", image: asset("more-contact.svg") },
];

export default function HomePage() {
  const location = useLocation();
  const [flyKey, setFlyKey] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(110);

  useEffect(() => {
    if ((location.state as { flyIn?: boolean } | null)?.flyIn) {
      setFlyKey((prev) => prev + 1);
    }
  }, [location.state]);

  useEffect(() => {
    function updateHeaderHeight() {
      const header = document.querySelector(".home-shell .topbar") as HTMLElement | null;
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    }

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  useEffect(() => {
    function replay() {
      setFlyKey((prev) => prev + 1);
    }
    window.addEventListener("home-fly-replay", replay);
    return () => window.removeEventListener("home-fly-replay", replay);
  }, []);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  return (
    <div className="app-shell home-shell">
      <MobileHeader />

      <section className="home-center-zone" style={{ minHeight: `calc(100dvh - ${headerHeight}px - 36px)` }}>
        <section className="home-primary-grid" key={`primary-${flyKey}`}>
          {primaryCards.map((card, index) => (
            <Link key={card.to} to={card.to} className="home-card home-card-lg home-fly" style={{ animationDelay: `${index * 70}ms` }}>
              <img src={card.image} alt="" className="home-card-image home-card-image-lg" />
              <div className="home-card-title">{card.title}</div>
              <div className="home-card-sub">{card.sub}</div>
            </Link>
          ))}
        </section>

        <section className="home-service-grid" key={`service-${flyKey}`}>
          {serviceCards.map((card, index) => (
            <Link key={card.to} to={card.to} className="home-card home-card-sm home-fly" style={{ animationDelay: `${140 + index * 70}ms` }}>
              <img src={card.image} alt="" className="home-card-image home-card-image-sm" />
              <div className="home-card-title home-card-title-sm">{card.title}</div>
            </Link>
          ))}
        </section>
      </section>
    </div>
  );
}
