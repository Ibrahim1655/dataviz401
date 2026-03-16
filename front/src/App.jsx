import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Departements from "./pages/departement";
import DepartementDetail from "./pages/DepartementDetail";
import Regions from "./pages/Regions";
import RegionDetail from "./pages/RegionDetail";
import Comparateur from "./pages/Comparateur";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/regions/:code" element={<RegionDetail />} />
          <Route path="/departements" element={<Departements />} />
          <Route path="/departements/:code" element={<DepartementDetail />} />
          <Route path="/comparateur" element={<Comparateur />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
