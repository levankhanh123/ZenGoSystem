import { useEffect, Suspense, useMemo } from 'react'
import { useRoutes, BrowserRouter, Route, Routes } from 'react-router-dom'
import { io } from "socket.io-client"
import { routers as buyerRouters } from './routers/Router'
import ErrorBoundary from './components/common/ErrorBoundary'
import AdminRoutes from "./admin/routes/AdminRoutes"
import SellerRegistration from "./components/SellerRegistration"
import SellerDashboard from "./components/SellerDashboard/SellerDashboard"
import ShipperDashboard from "./components/ShipperDashboard/ShipperDashboard"
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { SellerSessionProvider } from "./contexts/SellerSessionContext"
import { sellerAppRoutes } from "./routePaths"
import AllOrders from './components/SellerDashboard/AllOrders/AllOrders';
import HandoverOrders from './components/SellerDashboard/HandoverOrders/HandoverOrders';
import AllProducts from './components/SellerDashboard/AllProducts/AllProducts';
import AddProduct from './components/SellerDashboard/AddProduct/AddProduct';
import CancelledReturnOrders from './components/SellerDashboard/CancelledReturnOrders/CancelledReturnOrders';
import SellerChat from './components/SellerDashboard/SellerChat/SellerChat';
import ReviewManagement from './components/SellerDashboard/ReviewManagement/ReviewManagement';
import CampaignRegistration from './components/SellerDashboard/CampaignRegistration/CampaignRegistration';
import ShopVouchers from './components/SellerDashboard/ShopVouchers/ShopVouchers';
import BankAccounts from './components/SellerDashboard/Finance/BankAccounts';
import WithdrawalRequests from './components/SellerDashboard/Finance/WithdrawalRequests';
import RevenueDashboard from './components/SellerDashboard/Finance/RevenueDashboard';
import StatisticsDashboard from './components/SellerDashboard/Data/StatisticsDashboard';
import './App.css'

// Chỉ khởi tạo socket nếu có URL, tránh lỗi runtime
const SOCKET_URL = "http://localhost:3001";
const socket = io(SOCKET_URL, {
    autoConnect: false // Chỉ connect khi cần
});

// Helper function để chuyển đổi từ format {component: ...} sang {element: <Component />}
const transformRoutes = (routes) => {
    if (!Array.isArray(routes)) return [];
    
    return routes.map((route, index) => {
        const { component: Component, children, ...rest } = route;
        const result = { ...rest };
        
        // Gán key duy nhất nếu thiếu
        if (!result.key) {
            result.key = `route-${rest.path || 'index'}-${index}`;
        }
        
        if (Component) {
            // Đảm bảo Component là một function/component hợp lệ
            result.element = (
                <ErrorBoundary>
                    <Component />
                </ErrorBoundary>
            );
        }
        
        if (children) {
            result.children = transformRoutes(children);
        }
        
        return result;
    });
};

function SellerRouteView({ path }) {
    return (
        <SellerSessionProvider>
            <ErrorBoundary>
                {path === "/seller-dashboard" ? <SellerDashboard /> : <SellerRegistration />}
            </ErrorBoundary>
        </SellerSessionProvider>
    );
}

function BuyerRoutes() {
    const transformedRouters = useMemo(() => transformRoutes(buyerRouters), []);
    const routes = useRoutes(transformedRouters);
    return routes;
}

function AppContents() {
    useEffect(() => {
        socket.connect();
        
        const handleNotification = (data) => {
            console.log("Notification received:", data);
        };
        
        socket.on("receive_notification", handleNotification);
        
        return () => {
            socket.off("receive_notification", handleNotification);
            socket.disconnect();
        };
    }, []);

    return (
        <Routes>
            {/* Seller Registration */}
            <Route path="/seller-registration" element={<SellerRouteView path="/seller-registration" />} />

            {/* Seller Dashboard Nested Routes */}
            <Route path="/seller-dashboard" element={<SellerRouteView path="/seller-dashboard" />}>
                <Route index element={<StatisticsDashboard />} />
                <Route path="orders" element={<AllOrders />} />
                <Route path="handover" element={<HandoverOrders />} />
                <Route path="returns" element={<CancelledReturnOrders />} />
                <Route path="campaigns" element={<CampaignRegistration />} />
                <Route path="vouchers" element={<ShopVouchers />} />
                <Route path="products" element={<AllProducts />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="chat" element={<SellerChat />} />
                <Route path="reviews" element={<ReviewManagement />} />
                <Route path="revenue" element={<RevenueDashboard />} />
                <Route path="withdrawals" element={<WithdrawalRequests />} />
                <Route path="bank-accounts" element={<BankAccounts />} />
                <Route path="statistics" element={<StatisticsDashboard />} />
            </Route>
            
            {/* Admin Routes */}
            <Route 
                path="/admin/*" 
                element={
                    <ProtectedRoute role="admin">
                        <AdminRoutes />
                    </ProtectedRoute>
                } 
            />
            
            {/* Shipper Routes */}
            <Route 
                path="/shipper/*" 
                element={
                    <ProtectedRoute role="shipper">
                        <ShipperDashboard />
                    </ProtectedRoute>
                } 
            />
            
            {/* Buyer Routes - Handle anything else */}
            <Route path="/*" element={<BuyerRoutes />} />
        </Routes>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-screen bg-[#fdf6f4]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-bounce text-[#e91e8c] font-black text-3xl tracking-tighter">
                                zenGo
                            </div>
                            <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full bg-[#e91e8c] animate-progress" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                    </div>
                }>
                    <AppContents />
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
