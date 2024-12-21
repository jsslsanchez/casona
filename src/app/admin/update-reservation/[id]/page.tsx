// /app/admin/update-reservation/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert } from '@/components/ui/Alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Edit, Save, X } from 'lucide-react';

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
    id: number;
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

interface Room {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
}

interface UpdateReservationFormProps {
  reservationId: string;
}

export default function UpdateReservationForm({ reservationId }: UpdateReservationFormProps) {
  const router = useRouter();
  const { data: reservation, error } = useSWR<Reservation>(
    reservationId ? `/api/bookings/${reservationId}` : null,
    fetcher
  );

  const { data: availableRooms, error: roomsError } = useSWR<Room[]>(
    '/api/rooms',
    fetcher
  );

  const [status, setStatus] = useState<string>('Pending');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [updatedReservation, setUpdatedReservation] = useState({
    checkIn: '',
    checkOut: '',
    numGuests: 1,
    roomNumber: '',
    status: '',
  });

  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status);
      setUpdatedReservation({
        checkIn: reservation.checkIn.split('T')[0],
        checkOut: reservation.checkOut.split('T')[0],
        numGuests: reservation.numGuests,
        roomNumber: reservation.room.roomNumber,
        status: reservation.status,
      });
    }
  }, [reservation]);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleUpdate = async () => {
    // Validation: check-out after check-in and dates not in the past
    const today = new Date();
    const checkInDate = new Date(updatedReservation.checkIn);
    const checkOutDate = new Date(updatedReservation.checkOut);

    if (checkInDate < today || checkOutDate <= checkInDate) {
      setAlertMessage(
        'Check-in date must be today or in the future, and check-out date must be after check-in date.'
      );
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReservation),
      });

      if (response.ok) {
        setAlertMessage('Reservation updated successfully!');
        mutate(`/api/bookings/${reservationId}`);
        router.push('/admin/reservation-management');
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      setAlertMessage('An error occurred while updating the reservation.');
    }
  };

  if (error) return <p className="text-red-500">Error loading reservation.</p>;
  if (!reservation || !availableRooms)
    return <p className="text-[#5E3023]">Loading reservation...</p>;
  if (roomsError)
    return <p className="text-red-500">Error loading available rooms.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#F7EDE2] shadow-xl border-2 border-[#8B2500]">
          <CardHeader className="text-center flex items-center justify-center">
            <Edit className="w-8 h-8 text-[#5E3023] mr-2" />
            <CardTitle className="text-4xl font-bold text-[#5E3023]">
              Update Reservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
            <form className="space-y-6">
              {/* Guest Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#5E3023] font-semibold">Guest Name</Label>
                  <p className="text-lg text-[#8B4B3B]">{`${reservation.guest.firstName} ${reservation.guest.lastName}`}</p>
                </div>
                <div>
                  <Label className="text-[#5E3023] font-semibold">Guest Email</Label>
                  <p className="text-lg text-[#8B4B3B]">{reservation.guest.email}</p>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNumber" className="text-[#5E3023] font-semibold">Room Number</Label>
                  <Select
                    value={updatedReservation.roomNumber}
                    onValueChange={(value) =>
                      setUpdatedReservation({ ...updatedReservation, roomNumber: value })
                    }
                  >
                    <SelectTrigger className="w-full bg-white text-[#5E3023] border border-[#8B2500]">
                      <SelectValue placeholder="Select room number" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-[#5E3023]">
                      {availableRooms.map((room) => (
                        <SelectItem key={room.roomNumber} value={room.roomNumber}>
                          {room.roomNumber} - {room.roomType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numGuests" className="text-[#5E3023] font-semibold">Number of Guests</Label>
                  <Input
                    id="numGuests"
                    type="number"
                    min="1"
                    value={updatedReservation.numGuests}
                    onChange={(e) =>
                      setUpdatedReservation({ ...updatedReservation, numGuests: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn" className="text-[#5E3023] font-semibold">Check-in</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={updatedReservation.checkIn}
                    onChange={(e) =>
                      setUpdatedReservation({ ...updatedReservation, checkIn: e.target.value })
                    }
                    className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkOut" className="text-[#5E3023] font-semibold">Check-out</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={updatedReservation.checkOut}
                    onChange={(e) =>
                      setUpdatedReservation({ ...updatedReservation, checkOut: e.target.value })
                    }
                    className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                    required
                  />
                </div>
              </div>

              {/* Status Update */}
              <div>
                <Label className="text-[#5E3023] font-semibold">Status</Label>
                <Select
                  value={updatedReservation.status}
                  onValueChange={(value) => setUpdatedReservation({ ...updatedReservation, status: value })}
                >
                  <SelectTrigger className="w-full bg-white text-[#5E3023] border border-[#8B2500]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              onClick={() => router.push('/admin/reservation-management')}
              variant="outline"
              className="bg-red-500 border-[#8B2500] text-white hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#8B2500] hover:bg-[#5E3023] text-white flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update
            </Button>
          </CardFooter>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* Hidden trigger */}
            <span></span>
          </DialogTrigger>
          <DialogContent className="bg-white text-[#5E3023] border border-[#8B2500] rounded-lg p-6">
            <DialogHeader>
              <DialogTitle>Confirm Update</DialogTitle>
              <p>Are you sure you want to update this reservation?</p>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-4">
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="border-[#8B2500] text-[#8B2500] hover:bg-[#8B2500] hover:text-white flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                No
              </Button>
              <Button
                onClick={handleUpdate}
                className="bg-[#8B2500] hover:bg-[#5E3023] text-white flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Helper fetcher function (ensure it's imported correctly)
const fetcher = (url: string) => fetch(url).then((res) => res.json());