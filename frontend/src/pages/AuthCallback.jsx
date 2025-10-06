import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/actions";
import { toast } from "sonner";
import { apiGet } from "../lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem("token", token);
        dispatch(setUser({ ...user, token }));
        toast.success("Signed up with Google successfully!");
        if (user.role === "tech") {
          // Check if Technician document exists; if not, redirect to setup
          apiGet('/api/profile')
            .then((data) => {
              const hasTech = data?.profile?.tech;
              if (!hasTech) navigate('/tech-setup');
              else navigate('/dashboard/technician');
            })
            .catch(() => navigate('/dashboard/technician'));
        } else {
          navigate('/dashboard/customer');
        }
      } catch (err) {
        toast.error("Failed to process login");
        navigate("/login");
      }
    } else {
      toast.error("Authentication failed");
      navigate("/login");
    }
  }, [location, navigate, dispatch]);

  return <div className="flex items-center justify-center min-h-screen">Processing login...</div>;
}