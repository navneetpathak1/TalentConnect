import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { jobsService } from "@/services/jobs.service";
import { applicationService } from "@/services/application.service";
import { formatDate } from "@/utils/format";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { getInitials } from "@/utils/format";

export default function ManageJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsService.getJob(id!),
    enabled: !!id,
  });

  const { data: applications, isLoading: isLoadingApps } = useQuery({
    queryKey: ["job-applications", id],
    queryFn: () => applicationService.getJobApplications(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      applicationService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications", id] });
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
      setSelectedApplication(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  if (isLoadingJob || isLoadingApps) {
    return (
      <ProtectedLayout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!job) {
    return (
      <ProtectedLayout>
        <div className="container py-8">
          <div className="text-center">Job not found</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate(`/jobs/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Details
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Job: {job.title}</h1>
              <p className="text-muted-foreground mt-1">
                Posted on {formatDate(job.createdAt)} • {job.status}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Applicants</div>
            </div>
          </div>

          <div className="grid gap-6">
            {applications?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No applications yet
                </CardContent>
              </Card>
            ) : (
              applications?.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={app.user?.avatarUrl} />
                          <AvatarFallback>
                            {app.user ? getInitials(`${app.user.firstName} ${app.user.lastName}`) : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {app.user?.firstName} {app.user?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{app.user?.email}</p>
                          <p className="text-sm mt-1">{app.user?.bio}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                View Resume
                              </a>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Applied {formatDate(app.createdAt)}
                            </div>
                          </div>
                          {app.coverLetter && (
                            <div className="mt-4 p-4 bg-muted rounded-md text-sm">
                              <p className="font-medium mb-1">Cover Letter:</p>
                              {app.coverLetter}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Badge
                          variant={
                            app.status === "ACCEPTED"
                              ? "default" // Using default (primary color) for accepted
                              : app.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                          className={app.status === "ACCEPTED" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {app.status}
                        </Badge>
                        {app.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: app.id,
                                  status: "REJECTED",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  applicationId: app.id,
                                  status: "ACCEPTED",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
