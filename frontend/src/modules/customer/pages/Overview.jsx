import CustomerDashboardLayout from "../layout/CustomerLayout";
import Particles from "../../../components/effects/Particles";
import SplitText from "../../../components/effects/SplitText";
import ScrollReveal from "../../../components/effects/ScrollReveal";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CustomerOverview() {
  const navigate = useNavigate();
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs:list:overview'],
    queryFn: async () => {
      const data = await apiGet('/api/job/list');
      return data?.jobs || [];
    }
  });
  const jobs = jobsData || [];
  const openCount = jobs.filter(j => j.status && j.status !== 'completed' && j.status !== 'cancelled').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const loyaltyPoints = 0; // TODO: replace with real loyalty fetch when API is ready
  return (
    <CustomerDashboardLayout>
      <div className="container py-8 space-y-6">
        {/* Hero with subtle particles and animated heading */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
          <Particles className="opacity-20" particleColors={["#99f6e4","#e9d5ff","#fef3c7"]} particleCount={120} particleSpread={12} speed={0.12} particleBaseSize={18} />
          <div className="relative">
            <SplitText
              text="Welcome to FixItNow"
              className="block text-2xl md:text-3xl font-extrabold tracking-tight"
              delay={60}
              duration={0.4}
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
            />
            <ScrollReveal enableBlur baseOpacity={0} className="mt-2">
              <p className="text-slate-300 max-w-2xl">
                Book trusted home service professionals, track jobs in real-time, and earn loyalty points.
              </p>
            </ScrollReveal>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Overview
        </h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Open bookings</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{isLoading ? '…' : openCount}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total completed</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{isLoading ? '…' : completedCount}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Avg. rating</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">4.9</CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent jobs</h2>
            <Button variant="outline" onClick={() => navigate('/dashboard/customer/history')}>View all</Button>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Job</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Technician</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {(jobs.slice(0,5)).map(j => (
                  <tr key={j._id} className="border-t">
                    <td className="p-2">{j._id?.slice(-6) || '-'}</td>
                    <td className="p-2">{j.serviceType || '—'}</td>
                    <td className="p-2">{j.techId?.name || '—'}</td>
                    <td className="p-2 capitalize">{j.status || '—'}</td>
                    <td className="p-2">{j.createdAt ? new Date(j.createdAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {(!isLoading && jobs.length === 0) && (
                  <tr><td className="p-3 text-muted-foreground" colSpan={5}>No jobs yet. Try booking your first service.</td></tr>
                )}
                {isLoading && (
                  <tr><td className="p-3 text-muted-foreground" colSpan={5}>Loading…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}