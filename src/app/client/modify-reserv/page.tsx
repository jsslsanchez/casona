// /app/client/modify-reserv/page.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, Users, Bed, CreditCard, Edit, XCircle } from "lucide-react";
import useSWR from "swr";

const statusColors = {
  Confirmed: "bg-green-500",
  Pending: "bg-yellow-500",
  Cancelled: "bg-red-500",
};

interface Reservation {
  id: number;
  checkIn: string;
  checkOut: string;
  status: string;
  numGuests: number;
  totalAmount: number;
  paymentStatus: string;
  guest: {
    identification: string;
    documentType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
  };
  room: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
    capacity: number;
    size: number;
    features: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ViewModifyCancelReservation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const { data: reservation, error, mutate } = useSWR<Reservation>(
    reservationId ? `/api/reservations/${reservationId}` : null,
    fetcher
  );

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleModifyReservation = () => {
    router.push(`/client/reservation-form?id=${reservationId}`);
  };

  const handleCancelReservation = async () => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Reservation cancelled successfully!");
        mutate();
        setIsCancelDialogOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to cancel reservation.");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("An error occurred while cancelling the reservation.");
    }
  };

  if (error) return <p className="text-red-500">Error loading reservation.</p>;
  if (!reservation) return <p className="text-[#5E3023]">Loading reservation...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <Card className="max-w-2xl mx-auto bg-[#F7EDE2] shadow-lg border-2 border-[#8B2500]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold text-[#5E3023]">Reservation Details</CardTitle>
            <Badge className={`${statusColors[reservation.status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
              {reservation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-[#5E3023] font-semibold">Guest Name</p>
              <p className="text-lg text-[#8B4B3B]">
                {reservation.guest.firstName} {reservation.guest.lastName}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#5E3023] font-semibold">Email</p>
              <p className="text-lg text-[#8B4B3B]">{reservation.guest.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="text-[#5E3023]" />
            <div>
              <p className="text-sm text-[#5E3023] font-semibold">Check-in</p>
              <p className="text-lg text-[#8B4B3B]">{format(new Date(reservation.checkIn), "MMMM d, yyyy")}</p>
            </div>
            <div className="mx-2">-</div>
            <div>
              <p className="text-sm text-[#5E3023] font-semibold">Check-out</p>
              <p className="text-lg text-[#8B4B3B]">{format(new Date(reservation.checkOut), "MMMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Bed className="text-[#5E3023]" />
            <div>
              <p className="text-sm text-[#5E3023] font-semibold">Room Type</p>
              <p className="text-lg text-[#8B4B3B]">{reservation.room.roomType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="text-[#5E3023]" />
            <div>
              <p className="text-sm text-[#5E3023] font-semibold">Number of Guests</p>
              <p className="text-lg text-[#8B4B3B]">{reservation.numGuests}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="text-[#5E3023]" />
            <div>
              <p className="text-sm text-[#5E3023] font-semibold">Total Amount</p>
              <p className="text-lg text-[#8B4B3B]">${reservation.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-[#8B2500] text-[#8B2500] hover:bg-[#8B2500] hover:text-white"
          >
            Back
          </Button>
          <div className="flex space-x-2">
            <Button
              onClick={handleModifyReservation}
              className="bg-[#8B2500] hover:bg-[#5E3023] text-white transition-all duration-200"
            >
              <Edit className="mr-2 h-4 w-4" /> Modify Reservation
            </Button>
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#8B2500] text-[#8B2500] hover:bg-[#8B2500] hover:text-white"
                  disabled={reservation.status === "Cancelled"}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Reservation
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white text-black rounded-lg p-4">
                <DialogHeader>
                  <DialogTitle>Cancel Reservation</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this reservation? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                    Keep Reservation
                  </Button>
                  <Button variant="destructive" onClick={handleCancelReservation}>
                    Yes, Cancel Reservation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
}