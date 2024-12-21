// app/client/view-reservation/page.tsx

"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, XCircle } from "lucide-react";
import { AlertModal } from "@/components/ui/AlertModal";

interface Booking {
  id: number;
  checkIn: string;
  checkOut: string;
  status: string;
  numGuests: number;
  totalAmount: number;
  paymentStatus: string;
  paymentIntentId?: string;
  guest: {
    identification: string;
    documentType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  room: {
    roomNumber: string;
    roomType: string;
    description: string;
    pricePerNight: number;
    capacity: number;
    size: number;
    features: string;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ViewReservation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { data: booking, error } = useSWR<Booking>(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (!id) {
      console.error('No reservation ID provided.');
    }
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent">
        <p className="text-red-600 text-lg font-semibold">Invalid reservation ID.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent">
        <p className="text-red-600 text-lg font-semibold">Failed to load reservation details.</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent">
        <p className="text-secondary text-lg font-semibold">Loading reservation details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl border-2 border-primary p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-secondary mb-6">Reservation Details</h1>
        
        {/* Reservation Overview */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-3">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-700"><strong>ID:</strong> {booking.id}</p>
            <p className="text-gray-700"><strong>Status:</strong> {booking.status}</p>
            <p className="text-gray-700"><strong>Payment Status:</strong> {booking.paymentStatus}</p>
            <p className="text-gray-700"><strong>Number of Guests:</strong> {booking.numGuests}</p>
            <p className="text-gray-700"><strong>Total Amount:</strong> ${booking.totalAmount.toFixed(2)}</p>
          </div>
        </section>

        {/* Guest Information */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-3">Guest Information</h2>
          <div className="space-y-2">
            <p className="text-gray-700"><strong>Name:</strong> {booking.guest.firstName} {booking.guest.lastName}</p>
            <p className="text-gray-700"><strong>Email:</strong> {booking.guest.email}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {booking.guest.phone}</p>
            <p className="text-gray-700"><strong>Country:</strong> {booking.guest.country}</p>
          </div>
        </section>

        {/* Room Information */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-3">Room Information</h2>
          <div className="space-y-2">
            <p className="text-gray-700"><strong>Room Number:</strong> {booking.room.roomNumber}</p>
            <p className="text-gray-700"><strong>Room Type:</strong> {booking.room.roomType}</p>
            <p className="text-gray-700"><strong>Description:</strong> {booking.room.description}</p>
            <p className="text-gray-700"><strong>Price per Night:</strong> ${booking.room.pricePerNight.toFixed(2)}</p>
            <p className="text-gray-700"><strong>Capacity:</strong> {booking.room.capacity} Guests</p>
            <p className="text-gray-700"><strong>Size:</strong> {booking.room.size} m²</p>
            <p className="text-gray-700"><strong>Features:</strong> {booking.room.features}</p>
          </div>
        </section>

        {/* Booking Dates */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-3">Booking Dates</h2>
          <div className="space-y-2">
            <p className="text-gray-700"><strong>Check-In:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
            <p className="text-gray-700"><strong>Check-Out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Back
          </Button>
          {booking.paymentStatus !== "Paid" && (
            <Button
              onClick={() => router.push(`/client/payment?id=${booking.id}`)}
              className="bg-primary hover:bg-secondary text-white flex items-center space-x-2"
            >
              <CreditCard className="h-5 w-5" />
              <span>Proceed to Payment</span>
            </Button>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        title="Error"
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
        type="error"
      />
    </div>
  );
}