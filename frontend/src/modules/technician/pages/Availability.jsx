import TechnicianDashboardLayout from "../layout/TechnicianLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { useState } from "react";

export default function TechnicianAvailability() {
  const [available, setAvailable] = useState(true);
  return (
    <TechnicianDashboardLayout>
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Availability
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Online status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span>Available</span>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </CardContent>
        </Card>
      </div>
    </TechnicianDashboardLayout>
  );
}