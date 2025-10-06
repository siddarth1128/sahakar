import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useSelector } from "react-redux";

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.user) || {};
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome {user?.name || 'Admin'}. View a quick platform snapshot below.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">12,847</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">1,847</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">45,629</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>✅ Technician Approved: Rajesh Kumar</div>
            <div>⚖️ Dispute Resolved: #445</div>
            <div>📋 High Volume Alert: 234 bookings last hour</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div>Uptime: 99.8%</div>
            <div>API Response: 145ms</div>
            <div>Error Rate: 0.02%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
