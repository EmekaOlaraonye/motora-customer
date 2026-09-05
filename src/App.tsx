import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { CompareProvider } from './context/CompareContext';
import { SavedVehiclesProvider } from './context/SavedVehiclesContext';
import { ToastProvider } from './context/ToastContext';
import { AboutPage } from './pages/AboutPage';
import { ComparePage } from './pages/ComparePage';
import { GarageDetailPage } from './pages/GarageDetailPage';
import { GaragesPage } from './pages/GaragesPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SavedPage } from './pages/SavedPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { VehiclesPage } from './pages/VehiclesPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SavedVehiclesProvider>
          <CompareProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/vehicles/:slug" element={<VehicleDetailPage />} />
                <Route path="/garages" element={<GaragesPage />} />
                <Route path="/garages/:slug" element={<GarageDetailPage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </CompareProvider>
        </SavedVehiclesProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
