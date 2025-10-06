import { Outlet } from "react-router-dom";

export default function Dashboard() {
  // Layout container for role-specific dashboards
  return (
    <div className="container py-6">
      <Outlet />
    </div>
  );
}