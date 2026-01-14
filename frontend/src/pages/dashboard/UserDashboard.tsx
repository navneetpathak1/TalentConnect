import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { applicationService } from "@/services/application.service";
import { jobsService } from "@/services/jobs.service";
import { hackathonService } from "@/services/hackathon.service";
import { JobCard } from "@/components/JobCard";
import { HackathonCard } from "@/components/HackathonCard";
import { Briefcase } from "lucide-react";

export default function UserDashboard() {
  const { data: applications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: applicationService.getMyApplications,
  });

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["dashboard-jobs"],
    queryFn: () => jobsService.getJobs({ limit: 6 }),
  });

  const { data: hackathonsData, isLoading: isLoadingHackathons } = useQuery({
    queryKey: ["dashboard-hackathons"],
    queryFn: () => hackathonService.getHackathons({ limit: 6 }),
  });

  const renderJobs = () => {
    if (isLoadingJobs) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
               <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobsData?.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    );
  };

  const renderHackathons = () => {
    if (isLoadingHackathons) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
               <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hackathonsData?.hackathons.map((hackathon) => (
          <HackathonCard key={hackathon.id} hackathon={hackathon} />
        ))}
      </div>
    );
  };

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <div className="space-y-8">
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

          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Recent Jobs</h2>
                </div>
                {renderJobs()}
              </div>
            </TabsContent>
            
            <TabsContent value="hackathons" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Upcoming Hackathons</h2>
                </div>
                {renderHackathons()}
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="mt-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Recent Jobs</h2>
                </div>
                {renderJobs()}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Upcoming Hackathons</h2>
                </div>
                {renderHackathons()}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </ProtectedLayout>
  );
}

