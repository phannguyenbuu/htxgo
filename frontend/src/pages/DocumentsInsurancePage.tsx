import { useState } from "react";
import { asset } from "../assets";
import ImageModal from "../components/ImageModal";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function DocumentsInsurancePage() {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="app-shell">
      <MobileHeader />

      <section className="page-title">
        <h2>Bảo hiểm</h2>
        <p>Tình trạng giấy tờ và bảo hiểm xe</p>
      </section>

      <section className="ins-summary-grid">
        <article className="ins-summary-card ins-summary-red">
          <div className="ins-summary-count">1 giấy tờ</div>
          <div className="ins-summary-label">Sắp hết hạn</div>
        </article>
        <article className="ins-summary-card ins-summary-orange">
          <div className="ins-summary-count">2 giấy tờ</div>
          <div className="ins-summary-label">Cần chú ý</div>
        </article>
        <article className="ins-summary-card ins-summary-green">
          <div className="ins-summary-count">5 giấy tờ</div>
          <div className="ins-summary-label">Hợp lệ</div>
        </article>
      </section>

      <section className="ins-card-stack">
        <article className="ins-detail-card">
          <div className="ins-detail-title danger">🔴 ĐĂNG KIỂM</div>
          <div className="ins-detail-row">
            Còn <strong className="text-danger">5 ngày</strong> (Hết hạn: 18/02/2026)
          </div>
          <div className="ins-detail-line" />
          <div className="ins-detail-row">
            ⚠️ Có thể bị phạt đến <strong className="text-danger">6.000.000đ</strong>
          </div>
          <button className="ins-action-btn ins-action-danger">GIA HẠN NGAY</button>
        </article>

        <article className="ins-detail-card">
          <div className="ins-detail-title warning">🟠 BẢO HIỂM TNDS</div>
          <div className="ins-detail-row">
            Còn <strong className="text-warning">22 ngày</strong> (Hết hạn: 05/03/2026)
          </div>
          <div className="ins-detail-line" />
          <button className="ins-action-btn" onClick={() => setPreviewOpen(true)}>
            XEM CHI TIẾT <span className="ins-arrow">›</span>
          </button>
        </article>

        <article className="ins-detail-card">
          <div className="ins-detail-title safe">✅ GPLX</div>
          <div className="ins-detail-row">
            Còn <strong className="text-safe">3 năm</strong>
          </div>
        </article>
      </section>

      <MobileTabs />

      <ImageModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={asset("e0269081ce8b40d5199a.jpg")}
      />
    </div>
  );
}
