import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-[70vh] grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      <aside className="border rounded-lg p-4 h-max sticky top-4 self-start">
        <nav className="space-y-2">
          <NavLink
            to="/dashboard/admin/overview"
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-muted ${isActive ? 'bg-muted font-semibold' : ''}`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/dashboard/admin/technicians"
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-muted ${isActive ? 'bg-muted font-semibold' : ''}`
            }
          >
            Technicians
          </NavLink>
          <NavLink
            to="/dashboard/admin/customers"
            className={({ isActive }) =>
              `block px-3 py-2 rounded hover:bg-muted ${isActive ? 'bg-muted font-semibold' : ''}`
            }
          >
            Customers
          </NavLink>
        </nav>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
