import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DriversPage from "./pages/DriversPage";
import VehiclesPage from "./pages/VehiclesPage";
import DocumentsPage from "./pages/DocumentsPage";
import TransportOrdersPage from "./pages/TransportOrdersPage";
import TrackerPage from "./pages/TrackerPage";
import VetcPage from "./pages/VetcPage";

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
