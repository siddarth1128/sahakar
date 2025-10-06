import CustomerDashboardLayout from "../layout/CustomerLayout";

export default function CustomerSettings() {
  return (
    <CustomerDashboardLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Customer account settings.</p>
        {/* Add settings form/content here */}
      </div>
    </CustomerDashboardLayout>
  );
}