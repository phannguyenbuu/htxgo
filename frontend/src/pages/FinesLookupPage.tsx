import { FormEvent, useState } from "react";
import { api } from "../api";
import MobileHeader from "../components/MobileHeader";
import MobileTabs from "../components/MobileTabs";

type Violation = {
  violationTime?: string;
  violationLocation?: string;
  violationBehavior?: string;
  status?: string;
  detectionUnit?: string;
};

type LookupResponse = {
  licensePlate: string;
  violations: Violation[];
};

export default function FinesLookupPage() {
  const [plate, setPlate] = useState("50E57390");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);

  async function onLookup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!plate.trim()) {
      setError("Vui lòng nhập biển số.");
      return;
    }

    setLoading(true);
    try {
      const body = (await api.lookupFines(plate.replace(/\s+/g, ""))) as LookupResponse;
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tra cứu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <MobileHeader scrollDots={{ count: 1, activeIndex: 0 }} />

      <section className="page-title">
        <h2>Tra cứu phạt nguội</h2>
        <p>Kết nối API tra cứu vi phạm giao thông</p>
      </section>

      <section className="form-card">
        <div className="form-title">Nhập biển số</div>
        <form onSubmit={onLookup}>
          <label>
            Biển số xe
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="VD: 30H47465"
            />
          </label>
          <button className="primary full" type="submit" disabled={loading}>
            {loading ? "Đang tra cứu..." : "Tra cứu"}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </section>

      {result && (
        <section className="card-stack">
          {result.violations.length === 0 ? (
            <div className="list-card">
              <div className="list-title">Không có vi phạm</div>
              <div className="list-sub">Biển số: {result.licensePlate}</div>
            </div>
          ) : (
            result.violations.map((v, idx) => (
              <div key={`${v.violationTime || "item"}-${idx}`} className="list-card">
                <div className="list-title">Vi phạm #{idx + 1}</div>
                <div className="list-sub">Thời gian: {v.violationTime || "N/A"}</div>
                <div className="list-sub">Địa điểm: {v.violationLocation || "N/A"}</div>
                <div className="list-meta">Hành vi: {v.violationBehavior || "N/A"}</div>
                <div className="list-meta">Trạng thái: {v.status || "N/A"}</div>
                <div className="list-meta">Đơn vị phát hiện: {v.detectionUnit || "N/A"}</div>
              </div>
            ))
          )}
        </section>
      )}

      <MobileTabs />
    </div>
  );
}
