import { useState } from "react";
import { ApiError, api, setAuthTokens } from "../api";
import { asset } from "../assets";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.login({ username, password });
      setAuthTokens(data.access_token, data.refresh_token);
      window.location.reload();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setError("Sai tài khoản hoặc mật khẩu");
      } else if (apiError.status === 400) {
        setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      } else {
        setError((err as Error).message || "Đăng nhập thất bại");
      }
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand-line login-brand-line">
          <img src={asset("1.png")} alt="" className="brand-logo" />
          <div className="login-brand-copy">
            <div className="brand-title">TRỢ LÝ VICA</div>
            <div className="brand-sub">AI Agent của tài xế công nghệ</div>
          </div>
        </div>

        <h2 className="login-title">Đăng nhập</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg
                    className="password-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 3l18 18M10.58 10.58A2 2 0 0013.42 13.42M9.88 5.09A10.93 10.93 0 0112 5c5.05 0 9.27 3.11 10.5 7.5a11.82 11.82 0 01-4.13 5.94M6.61 6.61A11.86 11.86 0 001.5 12.5a11.82 11.82 0 005.73 6.64"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="password-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.5 12.5C2.73 8.11 6.95 5 12 5s9.27 3.11 10.5 7.5C21.27 16.89 17.05 20 12 20S2.73 16.89 1.5 12.5z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

