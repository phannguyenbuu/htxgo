import { useState } from "react";
import { asset } from "../assets";
import ImageModal from "../components/ImageModal";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

export default function DocumentsBadgePage() {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="app-shell">
      <MobileHeader />

      <section className="page-title">
        <h2>Phù hiệu</h2>
        <p>Nội dung giấy tờ xe và xã viên</p>
      </section>

      <section className="docs-block-grid">
        <article className="docs-block">
          <div className="docs-block-head">
            <span className="info-icon">🛡️</span>
            <span>Thông tin phù hiệu xe</span>
          </div>
          <div className="docs-pair-row"><span>Số HĐ</span><strong>HD7926015983</strong></div>
          <div className="docs-pair-row"><span>HTX</span><strong>HTX MINH VY</strong></div>
          <div className="docs-pair-row"><span>Biển số xe</span><strong>50E57390</strong></div>
          <div className="docs-pair-row"><span>Hết hạn</span><strong>16/01/2033</strong></div>
          <div className="docs-status-line">
            <span>Trạng thái:</span>
            <strong className="badge ok">Còn hạn</strong>
          </div>
        </article>

        <article className="docs-block">
          <div className="docs-block-head">
            <span className="info-icon">📄</span>
            <span>Giấy xác nhận xã viên</span>
          </div>
          <div className="docs-pair-row"><span>Ngày cấp</span><strong>20/06/2020</strong></div>
          <div className="docs-pair-row"><span>Ngày hết hạn</span><strong>16/01/2025</strong></div>
          <div className="docs-pair-row"><span>Người đại diện</span><strong>Nguyễn Văn Bình</strong></div>
          <div className="docs-status-line">
            <span>Tình trạng:</span>
            <strong className="badge warn">Sắp hết hạn</strong>
          </div>
        </article>
      </section>

      <button className="primary full" onClick={() => setPreviewOpen(true)}>
        Xem hình ảnh phù hiệu
      </button>

      <MobileTabs />

      <ImageModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={asset("e0269081ce8b40d5199a.jpg")}
      />
    </div>
  );
}
