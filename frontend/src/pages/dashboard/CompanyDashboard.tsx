import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";

export default function CompanyDashboard() {
  const navigate = useNavigate();

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Company Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your jobs and hackathons</p>
            </div>
            <Button onClick={() => navigate("/jobs/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Jobs</CardTitle>
                <CardDescription>Manage your job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate("/jobs")}>
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Hackathons</CardTitle>
                <CardDescription>Manage your hackathons</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate("/hackathons")}>
                  View All Hackathons
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

