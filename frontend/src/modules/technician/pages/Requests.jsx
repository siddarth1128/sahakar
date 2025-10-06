import TechnicianDashboardLayout from "../layout/TechnicianLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";

export default function TechnicianRequests() {
  return (
    <TechnicianDashboardLayout>
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Requests
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>New requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Quote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <Badge>Urgent</Badge> Plumbing
                  </TableCell>
                  <TableCell>Today 11:00 AM</TableCell>
                  <TableCell>221B Baker St</TableCell>
                  <TableCell>$95</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TechnicianDashboardLayout>
  );
}