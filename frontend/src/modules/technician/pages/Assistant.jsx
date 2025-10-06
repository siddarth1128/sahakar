import TechnicianDashboardLayout from "../layout/TechnicianLayout";
import AIChat from "../../../components/AIChat";

export default function TechnicianAssistant() {
  return (
    <TechnicianDashboardLayout>
      <div className="container py-2">
        <h1 className="text-2xl font-bold mb-3">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mb-4">Ask about drafts, schedules, parts, and earnings. I can also help draft job notes.</p>
        <AIChat persona="technician" context={{ locale: 'en-IN' }} />
      </div>
    </TechnicianDashboardLayout>
  );
}
