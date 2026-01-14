import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { authStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { jobsService } from "@/services/jobs.service";
import { JobCard } from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user } = authStore();

  const { data: myJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: jobsService.getMyJobs,
    enabled: user?.role === "COMPANY",
  });

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {user?.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                    {user?.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === "COMPANY" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">My Posted Jobs</h2>
              {isLoadingJobs ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                  ))}
                </div>
              ) : myJobs?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    You haven't posted any jobs yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myJobs?.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}

