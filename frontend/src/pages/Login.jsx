import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/actions";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import Input from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { GoogleIcon } from "../components/icons/GoogleIcon";
import { apiPost } from "../lib/api";
import TypingText from "../components/effects/TypingText";
import AnimatedBubbleParticles from "../components/effects/AnimatedBubbleParticles";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const role = form.role === "technician" ? "tech" : "user";
      const data = await apiPost('/api/auth/login', { 
        email: form.email, 
        password: form.password,
        role
      });
      if (data.success) {
        const { user, token } = data;
        localStorage.setItem("token", token);
        dispatch(setUser({ ...user, token }));
        const dashboardPath = user?.role === "tech" ? "/dashboard/technician" : "/dashboard/customer";
        navigate(dashboardPath);
        toast.success("Welcome back!");
      } else {
        toast.error(data.msg || data.error || "Login failed");
      }
    } catch (err) {
      const message = err?.message || "Login failed";
      // If role mismatch, try the other role once
      if (message.includes("different role")) {
        const otherRole = form.role === "technician" ? "customer" : "technician";
        toast.info(`Detected a ${otherRole} account. Switching role and retrying...`);
        try {
          const retryRole = otherRole === "technician" ? "tech" : "user";
          const data = await apiPost('/api/auth/login', {
            email: form.email,
            password: form.password,
            role: retryRole
          });
          if (data.success) {
            const { user, token } = data;
            localStorage.setItem("token", token);
            dispatch(setUser({ ...user, token }));
            const dashboardPath = user?.role === "tech" ? "/dashboard/technician" : "/dashboard/customer";
            setForm((f) => ({ ...f, role: otherRole }));
            navigate(dashboardPath);
            toast.success("Logged in successfully");
            return;
          }
        } catch (e2) {
          // Fall through to show error
        }
      }

      if (message.toLowerCase().includes("social login")) {
        toast.error("This account was created with Google. Please use 'Login with Google'.");
      } else if (message.toLowerCase().includes("different role")) {
        toast.error("This account is registered under a different role. Please select the correct role.");
      } else if (message.toLowerCase().includes("invalid credentials")) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const role = form.role === "technician" ? "tech" : "user";
    window.location.href = `${apiUrl}/api/auth/google?role=${role}`;
  };

  return (
    <AnimatedBubbleParticles className="bg-background" particleColor="#0F172A" spawnInterval={160}>
      <div className="container py-12">
        <div className="mx-auto max-w-md mb-6 text-center">
          <TypingText className="block" align="center">
            Sign in to FixItNow
          </TypingText>
          <p className="text-muted-foreground mt-2">Book trusted local pros fast.</p>
        </div>
        <Card className="mx-auto max-w-md shadow-lg/50">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Choose your login method below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full mb-4" type="button" onClick={handleGoogleLogin}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
          <form onSubmit={handleEmailSubmit} className="space-y-4 pt-4">
            <div className="grid gap-4">
              <Input
                placeholder="m@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="your password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="space-y-3">
                <label className="text-sm font-medium">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={form.role === "customer" ? "default" : "outline"}
                    className="h-10"
                    onClick={() => setForm({ ...form, role: "customer" })}
                  >
                    Customer
                  </Button>
                  <Button
                    type="button"
                    variant={form.role === "technician" ? "default" : "outline"}
                    className="h-10"
                    onClick={() => setForm({ ...form, role: "technician" })}
                  >
                    Technician
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>
    </AnimatedBubbleParticles>
  );
}