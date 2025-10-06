import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function RoleGuard({ expect, children }) {
  const { user, isAuthenticated } = useSelector((s) => s.user) || {};
  const location = useLocation();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!user.role) return <Navigate to="/dashboard" replace />;
  const ok =
    expect === user.role ||
    (expect === 'user' && user.role === 'user') ||
    (expect === 'tech' && user.role === 'tech') ||
    (expect === 'admin' && user.role === 'admin');
  if (!ok) {
    // Redirect to correct dashboard
    const roleSegment = user.role === 'tech' ? 'technician' : (user.role === 'admin' ? 'admin' : 'customer');
    return <Navigate to={`/dashboard/${roleSegment}`} replace />;
  }
  return children;
}
