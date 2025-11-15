import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function HackathonRound() {
  return (
    <ProtectedLayout>
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-4xl font-bold">Hackathon Round</h1>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}

