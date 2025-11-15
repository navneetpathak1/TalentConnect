import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { hackathonService } from "@/services/hackathon.service";

export default function HackathonList() {
  const { data, isLoading } = useQuery({
    queryKey: ["hackathons"],
    queryFn: () => hackathonService.getHackathons(),
  });

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-6">Hackathons</h1>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.hackathons.map((hackathon) => (
              <Card key={hackathon.id}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold">{hackathon.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

