import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/Authcontext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Hoặc một loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.vai_tro !== role) {
    // Nếu không đúng role, về trang chủ (Buyer site) 
    // Tuy nhiên nếu là shipper thì về /shipper, admin về /admin
    if (user.vai_tro === "shipper") return <Navigate to="/shipper" replace />;
    if (user.vai_tro === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
