import { useState } from "react";
import { Button } from "../components/ui/button";
import Input from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/actions";
import { toast } from "sonner";

export default function Auth() {
  const [customerForm, setCustomerForm] = useState({ email: "", password: "" });
  const [technicianForm, setTechnicianForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleSubmit = async (formData, submittedRole) => {
    const role = submittedRole === "technician" ? "tech" : "user";
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const { user, token } = data;
        localStorage.setItem("token", token);
        dispatch(setUser({ ...user, token }));
        const dashboardPath = role === "technician" ? "/dashboard/technician" : "/dashboard/customer";
        navigate(dashboardPath);
        toast.success("Welcome back!");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>User Sign in</CardTitle>
          <CardDescription>
            Book and manage your home service jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            type="email"
            value={customerForm.email}
            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={customerForm.password}
            onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
          />
          <Button className="w-full" onClick={() => handleSubmit(customerForm, "customer")} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-xs text-muted-foreground">
            No account? We'll create one on your first booking.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Provider Portal</CardTitle>
          <CardDescription>
            Register as a pro, set availability, and accept jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Business Email"
            type="email"
            value={technicianForm.email}
            onChange={(e) => setTechnicianForm({ ...technicianForm, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={technicianForm.password}
            onChange={(e) => setTechnicianForm({ ...technicianForm, password: e.target.value })}
          />
          <Button className="w-full" onClick={() => handleSubmit(technicianForm, "technician")} disabled={loading}>
            {loading ? "Entering..." : "Enter portal"}
          </Button>
          <p className="text-xs text-muted-foreground">
            We’ll guide you through verification and onboarding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}