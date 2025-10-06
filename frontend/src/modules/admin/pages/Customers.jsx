import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

const MOCK_CUSTOMERS = [
  { id: "cust_001", name: "Priya Sharma", email: "priya@example.com", bookings: 23, avgRating: 4.8, status: "active" },
  { id: "cust_002", name: "Rohit Sharma", email: "rohit@example.com", bookings: 5, avgRating: 4.5, status: "active" },
  { id: "cust_003", name: "Anita Gupta", email: "anita@example.com", bookings: 1, avgRating: 5.0, status: "active" },
];

export default function AdminCustomers() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Avg Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CUSTOMERS.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.bookings}</TableCell>
                    <TableCell>⭐ {c.avgRating}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
