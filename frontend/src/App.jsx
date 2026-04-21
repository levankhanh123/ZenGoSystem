import { useEffect, Suspense, useMemo } from 'react'
import { useRoutes, BrowserRouter } from 'react-router-dom'
import { io } from "socket.io-client"
import { routers } from './routers/Router'
import ErrorBoundary from './components/common/ErrorBoundary'
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

function AppContents() {
    useEffect(() => {
        socket.connect();
        
        const handleNotification = (data) => {
            alert("Thông báo mới: " + data.message);
        };
        
        socket.on("receive_notification", handleNotification);
        
        return () => {
            socket.off("receive_notification", handleNotification);
            socket.disconnect();
        };
    }, []);

    // Sử dụng useMemo để tránh re-transform mỗi lần render
    const transformedRouters = useMemo(() => transformRoutes(routers), []);
    const routes = useRoutes(transformedRouters);
    
    return routes || <div className="p-10 text-center text-gray-500">404 - Không tìm thấy nội dung</div>;
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
