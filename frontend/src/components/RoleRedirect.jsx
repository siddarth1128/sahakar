import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleRedirect() {
  const { user, isAuthenticated } = useSelector((state) => state.user) || {};
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  const roleSegment = user.role === 'tech' ? 'technician' : (user.role === 'admin' ? 'admin' : 'customer');
  return <Navigate to={`/dashboard/${roleSegment}`} replace />;
}
