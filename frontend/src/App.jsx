import "./bootstrap";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminRoutes from "./admin/routes/AdminRoutes";
import SellerRegistration from "./components/SellerRegistration";
import SellerDashboard from "./components/SellerDashboard/SellerDashboard";
import { SellerSessionProvider } from "./contexts/SellerSessionContext";
import { sellerAppRoutes, sellerDefaultRoute } from "./routePaths";

function SellerRouteView({ path }) {
    return (
        <SellerSessionProvider>
            {path === "/seller-dashboard" ? <SellerDashboard /> : <SellerRegistration />}
        </SellerSessionProvider>
    );
}

function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
                <Route path="/" element={<Navigate to={sellerDefaultRoute} replace />} />
                {sellerAppRoutes.map((path) => (
                    <Route key={path} path={path} element={<SellerRouteView path={path} />} />
                ))}
                <AdminRoutes />
                <Route path="*" element={<Navigate to={sellerDefaultRoute} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
