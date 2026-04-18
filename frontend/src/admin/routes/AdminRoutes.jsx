import { Navigate, Route } from "react-router-dom";
import AdminErrorBoundary from "../components/AdminErrorBoundary";
import AdminLayout from "../layouts/AdminLayout";
import { adminRouteConfig } from "./adminRouteConfig";

export default function AdminRoutes() {
    return (
        <Route
            path="/admin"
            element={(
                <AdminErrorBoundary>
                    <AdminLayout />
                </AdminErrorBoundary>
            )}
        >
            {adminRouteConfig.map((route) => {
                if (route.index) {
                    return (
                        <Route
                            key="admin-index"
                            index
                            element={<Navigate to={route.redirectTo} replace />}
                        />
                    );
                }

                const RouteComponent = route.element;

                return (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={<RouteComponent />}
                    />
                );
            })}
        </Route>
    );
}