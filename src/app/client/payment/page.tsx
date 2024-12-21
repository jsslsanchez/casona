// app/client/payment/page.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/ui/AlertModal";
import { CreditCard } from "lucide-react";
import useSWR from "swr";

interface Booking {
  id: number;
  totalAmount: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const { data: booking, error: bookingError } = useSWR<Booking>(
    reservationId ? `/api/bookings/${reservationId}` : null,
    fetcher
  );

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvc) {
      setAlertMessage("Please fill in all payment details.");
      setIsAlertOpen(true);
      return;
    }

    if (!booking) {
      setAlertMessage("Booking details not loaded. Please try again.");
      setIsAlertOpen(true);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: booking.id,
          amount: booking.totalAmount,
          cardNumber,
          expiryDate,
          cvc,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to payment success page
        router.push(`/client/payment-success?id=${booking.id}`);
      } else {
        setAlertMessage(data.error || "Payment failed. Please try again.");
        setIsAlertOpen(true);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setAlertMessage("An error occurred during payment. Please try again.");
      setIsAlertOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!reservationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-8">
        <p className="text-red-600 text-lg font-semibold">Invalid reservation ID.</p>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-8">
        <p className="text-red-600 text-lg font-semibold">Failed to load booking details.</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-8">
        <p className="text-secondary text-lg font-semibold">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-8">
      <Card className="max-w-lg bg-white shadow-lg border-2 border-primary p-6 rounded-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="text-primary h-6 w-6" />
            <CardTitle className="text-2xl font-bold text-primary">Complete Your Payment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount Display */}
          <p className="text-lg text-secondary">
            Amount to Pay: <span className="font-semibold">${booking.totalAmount.toFixed(2)}</span>
          </p>
          {/* Payment Form */}
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-primary font-semibold mb-1">
                Card Number
              </label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full bg-white text-gray-800 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Expiry Date & CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-primary font-semibold mb-1">
                  Expiry Date
                </label>
                <Input
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full bg-white text-gray-800 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-primary font-semibold mb-1">
                  CVC
                </label>
                <Input
                  id="cvc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  className="w-full bg-white text-gray-800 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </CardContent>
        {/* Action Buttons */}
        <div className="flex justify-between p-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="bg-primary hover:bg-secondary text-white"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </Card>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        title="Payment Error"
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
        type="error"
      />
    </div>
  );
}