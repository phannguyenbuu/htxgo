import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DriversPage from "./pages/DriversPage";
import VehiclesPage from "./pages/VehiclesPage";
import DocumentsPage from "./pages/DocumentsPage";
import TransportOrdersPage from "./pages/TransportOrdersPage";
import TrackerPage from "./pages/TrackerPage";
import VetcPage from "./pages/VetcPage";
import RegisterHtxPage from "./pages/RegisterHtxPage";
import ContactPage from "./pages/ContactPage";
import HtxStatsPage from "./pages/HtxStatsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/drivers" element={<DriversPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/more/transport" element={<TransportOrdersPage />} />
      <Route path="/more/tracker" element={<TrackerPage />} />
      <Route path="/more/vetc" element={<VetcPage />} />
      <Route path="/more/register" element={<RegisterHtxPage />} />
      <Route path="/more/contact" element={<ContactPage />} />
      <Route path="/more/stats" element={<HtxStatsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
