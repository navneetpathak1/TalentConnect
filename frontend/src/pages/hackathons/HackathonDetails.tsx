import { useParams } from "react-router-dom";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function HackathonDetails() {
  const { id } = useParams();

  return (
    <ProtectedLayout>
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-4xl font-bold">Hackathon Details</h1>
            <p>Hackathon ID: {id}</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}

