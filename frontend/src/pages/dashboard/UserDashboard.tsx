import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/application.service";
import { Briefcase, FileText, TrendingUp } from "lucide-react";

export default function UserDashboard() {
  const { data: applications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationService.getMyApplications,
  });

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back!</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total applications</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{app.job?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.job?.organization?.name}
                        </p>
                      </div>
                      <span className="text-sm">{app.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No applications yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}

