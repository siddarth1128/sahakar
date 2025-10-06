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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { GoogleIcon } from "../components/icons/GoogleIcon";
import { apiPost } from "../lib/api";
import TypingText from "../components/effects/TypingText";
import AnimatedBubbleParticles from "../components/effects/AnimatedBubbleParticles";

export default function Signup() {
  const [activeTab, setActiveTab] = useState("email");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
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
      const data = await apiPost('/api/auth/signup', { 
        name: form.name, 
        email: form.email, 
        password: form.password, 
        role 
      });
      if (data.success) {
        // Backend returns token and user
        const { user, token } = data;
        localStorage.setItem("token", token);
        dispatch(setUser({ ...user, token }));
        toast.success("Account created! Logging you in...");
        const dashboardPath = user?.role === "tech" ? "/dashboard/technician" : "/dashboard/customer";
        navigate(dashboardPath);
      } else {
        toast.error(data.msg || data.error || "Signup failed");
      }

    } catch (err) {
      const message = err?.message || "Signup failed";
      if (message.toLowerCase().includes("already exists")) {
        toast.error("Account already exists. Try logging in instead.");
      } else if (message.toLowerCase().includes("password must be at least")) {
        toast.error("Password must be at least 6 characters");
      } else if (message.toLowerCase().includes("valid email")) {
        toast.error("Please enter a valid email address");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const role = form.role === "technician" ? "tech" : "user";
    window.location.href = `${apiUrl}/api/auth/google?role=${role}`;
  };

  return (
    <AnimatedBubbleParticles className="bg-background" particleColor="#0F172A" spawnInterval={160}>
      <div className="container py-12">
        <div className="mx-auto max-w-md mb-6 text-center">
          <TypingText className="block" align="center">
            Create your FixItNow account
          </TypingText>
          <p className="text-muted-foreground mt-2">Get started in seconds.</p>
        </div>
        <Card className="mx-auto max-w-md shadow-lg/50">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <Button variant="outline" className="w-full mb-4" type="button" onClick={() => {
                const role = form.role === "technician" ? "tech" : "user";
                window.location.href = `${apiUrl}/api/auth/google?role=${role}`;
              }}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>

              <form onSubmit={handleEmailSubmit} className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <Input
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
            
          </Tabs>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
        </Card>

      </div>
    </AnimatedBubbleParticles>
  );
}