import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicOnly({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  if (isAuthenticated && user) {
    const role = user.role === 'tech' ? 'technician' : (user.role === 'admin' ? 'admin' : 'customer');
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  return children;
}
