import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hackathon } from "@/services/hackathon.service";
import { formatDate, getInitials } from "@/utils/format";
import { Calendar, Trophy, Users } from "lucide-react";

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
        onClick={() => navigate(`/hackathons/${hackathon.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{hackathon.title}</CardTitle>
              {hackathon.organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={hackathon.organization.logoUrl} />
                    <AvatarFallback>{getInitials(hackathon.organization.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{hackathon.organization.name}</span>
                </div>
              )}
            </div>
            <Badge variant={hackathon.status === "OPEN" ? "default" : "secondary"}>
              {hackathon.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <CardDescription className="line-clamp-2 mb-4 flex-1">{hackathon.description}</CardDescription>
          
          <div className="space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
            </div>
            
            {hackathon.prizePool && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>Prize Pool: {hackathon.prizePool}</span>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
            Posted {formatDate(hackathon.createdAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
