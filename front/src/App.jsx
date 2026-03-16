import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Departements from "./pages/departement";
import DepartementDetail from "./pages/DepartementDetail";
import PlaceholderPage from "./components/PlaceholderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/regions"
            element={<PlaceholderPage title="Régions" />}
          />
          <Route path="/departements" element={<Departements />} />
          <Route path="/departements/:code" element={<DepartementDetail />} />
          <Route
            path="/comparateur"
            element={<PlaceholderPage title="Comparateur" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
