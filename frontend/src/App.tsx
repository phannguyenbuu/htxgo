import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DriversPage from "./pages/DriversPage";
import VehiclesPage from "./pages/VehiclesPage";
import DocumentsBadgePage from "./pages/DocumentsBadgePage";
import DocumentsInsurancePage from "./pages/DocumentsInsurancePage";
import TransportOrdersPage from "./pages/TransportOrdersPage";
import VetcPage from "./pages/VetcPage";
import RegisterHtxPage from "./pages/RegisterHtxPage";
import ContactPage from "./pages/ContactPage";
import HtxStatsPage from "./pages/HtxStatsPage";
import FinesLookupPage from "./pages/FinesLookupPage";
import LoginPage from "./pages/LoginPage";
import { getToken } from "./api";

function AuthGuard() {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function LoginGuard() {
  const token = getToken();
  return token ? <Navigate to="/" replace /> : <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGuard />} />
      <Route element={<AuthGuard />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/documents" element={<Navigate to="/documents/phu-hieu" replace />} />
        <Route path="/documents/phu-hieu" element={<DocumentsBadgePage />} />
        <Route path="/documents/bao-hiem" element={<DocumentsInsurancePage />} />
        <Route path="/more/transport" element={<TransportOrdersPage />} />
        <Route path="/more/phat-nguoi" element={<FinesLookupPage />} />
        <Route path="/more/vetc" element={<VetcPage />} />
        <Route path="/more/register" element={<RegisterHtxPage />} />
        <Route path="/more/contact" element={<ContactPage />} />
        <Route path="/more/stats" element={<HtxStatsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
