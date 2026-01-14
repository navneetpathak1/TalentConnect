import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { jobsService } from "@/services/jobs.service";
import { formatDate, formatCurrency } from "@/utils/format";
import { MapPin, Briefcase, ArrowLeft } from "lucide-react";
import { ApplyJobDialog } from "@/components/ApplyJobDialog";
import { authStore } from "@/store/auth.store";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const { user } = authStore();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsService.getJob(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="container py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!job) {
    return (
      <ProtectedLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Job not found</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedLayout>
    );
  }


  const isOwner = user?.id === job?.postedById;
  const isCompany = user?.role === "COMPANY";

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Button variant="ghost" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                      {job.organization && (
                        <CardDescription className="text-lg">
                          {job.organization.name}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-6">
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.remote && <Badge variant="outline">Remote</Badge>}
                    {job.salaryMin && job.salaryMax && (
                      <span className="font-medium">
                        {formatCurrency(job.salaryMin, job.currency)} -{" "}
                        {formatCurrency(job.salaryMax, job.currency)}
                      </span>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {job.tags && job.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>
                    {isOwner ? "Manage Job" : "Apply for this job"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOwner ? (
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/jobs/${job.id}/manage`)}
                    >
                      View Applications
                    </Button>
                  ) : !isCompany ? (
                    <Button className="w-full" onClick={() => setShowApplyDialog(true)}>
                      Apply Now
                    </Button>
                  ) : (
                    <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground text-center">
                      Company accounts cannot apply to jobs.
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Posted on {formatDate(job.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {showApplyDialog && (
          <ApplyJobDialog jobId={job.id} onClose={() => setShowApplyDialog(false)} />
        )}
      </div>
    </ProtectedLayout>
  );
}

