import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { apiPost } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: request, 2: reset
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/request-password-reset', { email });
      if (data.success) {
        toast.success("Reset link generated. Check your inbox.");
        if (data.token) {
          toast.info(`Dev token: ${data.token}`);
          setToken(data.token);
        }
        setStep(2);
      } else {
        toast.error(data.msg || "Failed to request reset");
      }
    } catch (err) {
      toast.error(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Enter the reset token");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/reset-password', { token, password: newPassword });
      if (data.success) {
        toast.success("Password reset successful! Please log in.");
        navigate("/login");
      } else {
        toast.error(data.msg || "Reset failed");
      }
    } catch (err) {
      toast.error(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Reset your password in two quick steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleRequest} className="space-y-4 pt-2">
              <Input
                placeholder="m@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 pt-2">
              <Input
                placeholder="Paste reset token (dev only)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Input
                placeholder="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Remember your password? <Link to="/login" className="underline">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}