import CustomerDashboardLayout from "../layout/CustomerLayout";
import AIChat from "../../../components/AIChat";

export default function CustomerAssistant() {
  return (
    <CustomerDashboardLayout>
      <div className="container py-2">
        <h1 className="text-2xl font-bold mb-3">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mb-4">Ask booking, pricing, and service questions. I can also rebook or suggest nearby pros.</p>
        <AIChat persona="customer" context={{ locale: 'en-IN' }} />
      </div>
    </CustomerDashboardLayout>
  );
}
