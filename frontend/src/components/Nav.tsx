import { clearToken } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/");
    window.location.reload();
  }

  return (
    <nav className="sidebar">
      <h3>dPaper</h3>
      <Link to="/">Tong quan</Link>
      <Link to="/drivers">Tai xe</Link>
      <Link to="/vehicles">Phuong tien</Link>
      <Link to="/documents">Giay to</Link>
      <Link to="/units">Hop tac xa</Link>
      <button className="link" onClick={logout}>
        Dang xuat
      </button>
    </nav>
  );
}
