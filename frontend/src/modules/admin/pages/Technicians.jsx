import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

const MOCK_TECHS = [
  { id: "tech_001", name: "Rajesh Kumar", service: "Plumbing", location: "Noida", rating: 4.9, jobs: 234, status: "active" },
  { id: "tech_002", name: "Meera Patel", service: "Electrical", location: "Gurugram", rating: 4.8, jobs: 189, status: "active" },
  { id: "tech_003", name: "Amit Singh", service: "AC Repair", location: "Delhi", rating: 4.7, jobs: 156, status: "inactive" },
  { id: "tech_004", name: "Sunita Devi", service: "Cleaning", location: "Faridabad", rating: 4.9, jobs: 278, status: "active" },
];

export default function AdminTechnicians() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TECHS.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.service}</TableCell>
                    <TableCell>{t.location}</TableCell>
                    <TableCell>⭐ {t.rating}</TableCell>
                    <TableCell>{t.jobs}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.status}
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
