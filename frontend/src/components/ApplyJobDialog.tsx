import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { applicationService } from "@/services/application.service";
import { uploadService } from "@/services/upload.service";

const applySchema = z.object({
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyJobDialogProps {
  jobId: string;
  onClose: () => void;
}

export function ApplyJobDialog({ jobId, onClose }: ApplyJobDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    setIsLoading(true);
    try {
      let resumeUrl = data.resumeUrl;

      if (resumeFile) {
        try {
          const response = await uploadService.getPresignedUrl(
            "resume",
            resumeFile.name,
            resumeFile.type
          );
          
          
          // Check if this is Supabase or S3
          if (response.storageType === "supabase" || (response.bucket && response.path)) {
            // Use proxy upload to avoid CORS issues
            const { fileToBase64 } = await import("@/utils/file");
            const base64Content = await fileToBase64(resumeFile);
            const uploadResult = await uploadService.uploadProxy(
                "resume",
                resumeFile,
                base64Content
            );
            resumeUrl = uploadResult.key;
          } else {
            // S3 upload (default)
            await uploadService.uploadToS3(response.url, resumeFile);
            resumeUrl = response.key;
          }
        } catch (uploadError: any) {
          // If upload service is unavailable (503), allow application without resume
          if (uploadError.response?.status === 503) {
            toast({
              title: "Resume upload unavailable",
              description:
                "File upload service is not configured. Your application will be submitted without a resume.",
              variant: "default",
            });
            // Continue without resume
          } else {
            throw uploadError;
          }
        }
      }

      await applicationService.apply({
        jobId,
        resumeUrl,
        coverLetter: data.coverLetter,
      });

      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.response?.data?.error?.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for this job</DialogTitle>
          <DialogDescription>Submit your application and resume</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {resumeFile && <p className="text-sm text-muted-foreground">{resumeFile.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're a great fit..."
              rows={6}
              {...register("coverLetter")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

