import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Job } from "@/services/jobs.service";
import { formatDate, formatCurrency, getInitials } from "@/utils/format";
import { MapPin, Briefcase } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate(`/jobs/${job.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
              {job.organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={job.organization.logoUrl} />
                    <AvatarFallback>{getInitials(job.organization.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{job.organization.name}</span>
                </div>
              )}
            </div>
            <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2 mb-4">{job.description}</CardDescription>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
            )}
            {job.remote && <Badge variant="outline">Remote</Badge>}
            {job.salaryMin && job.salaryMax && (
              <span className="text-sm font-medium">
                {formatCurrency(job.salaryMin, job.currency)} -{" "}
                {formatCurrency(job.salaryMax, job.currency)}
              </span>
            )}
          </div>
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">{formatDate(job.createdAt)}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

