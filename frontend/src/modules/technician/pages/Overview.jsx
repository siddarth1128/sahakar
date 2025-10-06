import TechnicianDashboardLayout from "../layout/TechnicianLayout";
import Particles from "../../../components/effects/Particles";
import SplitText from "../../../components/effects/SplitText";
import ScrollReveal from "../../../components/effects/ScrollReveal";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function TechnicianOverview() {
  return (
    <TechnicianDashboardLayout>
      <div className="container py-8 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
          <Particles className="opacity-15" particleColors={["#60a5fa","#a78bfa","#34d399"]} particleCount={110} particleSpread={12} speed={0.12} particleBaseSize={16} />
          <div className="relative">
            <SplitText
              text="Welcome, Technician"
              className="block text-2xl md:text-3xl font-extrabold tracking-tight"
              delay={60}
              duration={0.4}
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
            />
            <ScrollReveal enableBlur baseOpacity={0} className="mt-2">
              <p className="text-slate-300 max-w-2xl">
                Manage requests, update availability, and track your performance in one place.
              </p>
            </ScrollReveal>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Overview</h1>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pending requests</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">0</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active jobs</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">0</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jobs completed</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">0</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Avg. rating</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">4.8</CardContent>
          </Card>
        </div>
      </div>
    </TechnicianDashboardLayout>
  );
}
