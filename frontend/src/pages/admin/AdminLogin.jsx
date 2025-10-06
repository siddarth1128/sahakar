import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setUser } from "../../redux/actions";
import { apiPost } from "../../lib/api";
import { Button } from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost('/api/auth/login', {
        email: form.email,
        password: form.password,
        role: 'admin',
      });
      if (data?.success) {
        const { user, token } = data;
        if (user?.role !== 'admin') {
          toast.error('This account is not an admin account.');
          setLoading(false);
          return;
        }
        localStorage.setItem('token', token);
        dispatch(setUser({ ...user, token }));
        toast.success('Welcome, Admin!');
        navigate('/dashboard/admin');
      } else {
        toast.error(data?.msg || data?.error || 'Login failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in with your admin credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Not an admin? <Link to="/login" className="underline">User/Technician login</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
