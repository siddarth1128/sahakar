import CustomerDashboardLayout from "../layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboardCustom() {
  const navigate = useNavigate();

  // Mocked data to mirror the provided dashboard example
  const stats = [
    { icon: "📊", label: "Total Bookings", value: 23 },
    { icon: "⚡", label: "Active Jobs", value: 2 },
    { icon: "⭐", label: "Loyalty Points", value: "1,250", cta: { text: "Redeem", onClick: () => {} } },
    { icon: "📈", label: "Avg Rating", value: 4.8 },
  ];

  const recentActivity = [
    { icon: "✅", title: "Job completed by Amit Singh", time: "2 hours ago" },
    { icon: "💬", title: "New message from Rajesh Kumar", time: "5 minutes ago" },
    { icon: "⭐", title: "You earned 50 loyalty points", time: "Yesterday" },
  ];

  const quickActions = [
    { icon: "🔍", label: "Find Technician", onClick: () => navigate('/dashboard/customer/search') },
    { icon: "🚨", label: "Emergency Service", onClick: () => navigate('/dashboard/customer/search') },
    { icon: "🔄", label: "Repeat Booking", onClick: () => navigate('/dashboard/customer/history') },
    { icon: "🤖", label: "AI Assistant", onClick: () => navigate('/dashboard/customer/assistant') },
  ];

  return (
    <CustomerDashboardLayout>
      <div className="container py-8 space-y-8">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, Priya! 👋</h1>
          <p className="text-muted-foreground">Let's get your home services sorted today</p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Card key={i} className={i === 2 ? 'border-green-200' : ''}>
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="text-2xl" aria-hidden>{s.icon}</div>
                <CardTitle className="text-base">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-3xl font-bold">{s.value}</div>
                {s.cta && (
                  <Button size="sm" onClick={s.cta.onClick}> {s.cta.text} </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weather suggestion */}
        <div className="rounded-lg border p-5 flex items-center gap-4 bg-amber-50">
          <div className="text-3xl">🌧️</div>
          <div className="flex-1">
            <h3 className="font-semibold">Perfect time for plumbing checkups!</h3>
            <p className="text-muted-foreground">It's rainy today (24°C). Great weather for leak repairs and waterproofing.</p>
          </div>
          <Button onClick={() => navigate('/dashboard/customer/search')} size="sm">Find Plumbers</Button>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {quickActions.map((a, i) => (
              <button key={i} onClick={a.onClick} className="rounded-lg border p-6 hover:bg-muted/50 transition flex flex-col items-center gap-2">
                <div className="text-2xl" aria-hidden>{a.icon}</div>
                <div className="font-medium text-center">{a.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Activity</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/customer/history')}>View all</Button>
          </div>
          <div className="rounded-md border divide-y">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                <div className="text-xl" aria-hidden>{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
