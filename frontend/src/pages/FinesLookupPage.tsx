import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9.-]/g, "").replace(/\s+/g, "").trim();
}

export default function FinesLookupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plate, setPlate] = useState(() => normalizePlate(searchParams.get("plate") || "50E57390"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);

  async function lookupByPlate(targetPlate: string) {
    setError("");
    setResult(null);

    setLoading(true);
    try {
      const body = (await api.lookupFines(targetPlate)) as LookupResponse;
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tra cứu.");
    } finally {
      setLoading(false);
    }
  }

  async function onLookup() {
    const normalized = normalizePlate(plate);
    if (!normalized) {
      setError("Vui lòng nhập biển số.");
      setResult(null);
      return;
    }

    setPlate(normalized);

    const queryPlate = normalizePlate(searchParams.get("plate") || "");
    if (queryPlate !== normalized) {
      setSearchParams({ plate: normalized });
      return;
    }

    await lookupByPlate(normalized);
  }

  useEffect(() => {
    const queryPlate = normalizePlate(searchParams.get("plate") || "");
    if (!queryPlate) {
      return;
    }

    setPlate(queryPlate);
    void lookupByPlate(queryPlate);
  }, [searchParams]);

  return (
    <div className="app-shell">
      <MobileHeader scrollDots={{ count: 1, activeIndex: 0 }} />

      <section className="page-title">
        <h2>Tra cứu phạt nguội</h2>
        <p>Kết nối API tra cứu vi phạm giao thông</p>
      </section>

      <section className="form-card">
        <div className="form-title">Nhập biển số cần tra cứu</div>
        <label>
          Biển số xe
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="VD: 50E57390"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void onLookup();
              }
            }}
          />
        </label>

        <button className="primary full" type="button" onClick={() => void onLookup()} disabled={loading}>
          {loading ? "Đang tra cứu..." : "Tra cứu ngay"}
        </button>
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
