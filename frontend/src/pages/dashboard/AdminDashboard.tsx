import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <ProtectedLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage the platform</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Admin features coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}

