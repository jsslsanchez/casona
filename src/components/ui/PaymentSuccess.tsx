// components/ui/PaymentSuccess.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentSuccessProps {
  reservationId: number;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ reservationId }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-8">
      <Card className="max-w-lg bg-white shadow-lg border-2 border-primary p-6 rounded-lg text-center">
        <CardHeader className="flex flex-col items-center">
          <CheckCircle className="text-green-500 h-12 w-12" />
          <CardTitle className="text-3xl font-bold text-primary mt-4">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-secondary">
            Your payment has been processed successfully. Thank you for your reservation.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.push(`/client/view-reservation?id=${reservationId}`)}
              className="bg-primary hover:bg-secondary text-white"
            >
              View Reservation
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
