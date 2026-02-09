import { useState } from "react";
import { api, setToken } from "../api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.login({ username, password });
      setToken(data.access_token);
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand-line">
          <div className="brand-icon" />
          <div>
            <div className="brand-title">HTX Go</div>
            <div className="brand-sub">Quan ly giay to</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit">Dang nhap</button>
        </form>
      </div>
    </div>
  );
}
