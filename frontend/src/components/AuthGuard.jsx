import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;