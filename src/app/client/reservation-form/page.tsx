// app/client/reservation-form/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/ui/AlertModal";
import { CreditCard } from "lucide-react";

interface Guest {
  identification: string;
  documentType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

interface Room {
  roomNumber: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  size: number;
  features: string;
}

export default function ReservationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters for autofill
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialRoomNumber = searchParams.get('roomNumber') || '';

  const [formData, setFormData] = useState({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    numGuests: 1,
    totalAmount: 0,
    roomNumber: initialRoomNumber,
    guest: {
      identification: '',
      documentType: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch available rooms
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [roomsError, setRoomsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms.');
        }
        const roomsData = await response.json();
        setRooms(roomsData);
      } catch (err) {
        console.error(err);
        setRoomsError(true);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('guest.')) {
      const guestField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        guest: {
          ...prev.guest,
          [guestField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'numGuests' || name === 'totalAmount' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAlertMessage("");

    // Basic front-end validation
    if (
      !formData.checkIn ||
      !formData.checkOut ||
      !formData.roomNumber ||
      !formData.guest.identification ||
      !formData.guest.documentType ||
      !formData.guest.firstName ||
      !formData.guest.lastName ||
      !formData.guest.email ||
      !formData.guest.phone ||
      !formData.guest.country
    ) {
      setError('Please fill in all required fields.');
      setAlertMessage("Please fill in all required fields.");
      setIsAlertOpen(true);
      return;
    }

    // Validate that check-out is after check-in
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    if (checkOutDate <= checkInDate) {
      setError('Check-Out date must be after Check-In date.');
      setAlertMessage("Check-Out date must be after Check-In date.");
      setIsAlertOpen(true);
      return;
    }

    // Ensure that totalAmount is greater than 0
    if (formData.totalAmount <= 0) {
      setError('Total amount must be greater than $0.00.');
      setAlertMessage("Total amount must be greater than $0.00.");
      setIsAlertOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong.');
        setAlertMessage(data.error || "Something went wrong.");
        setIsAlertOpen(true);
        return;
      }

      console.log('Booking created:', data); // Debugging log

      // Redirect to payment page
      router.push(`/client/payment?id=${data.id}`);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking.');
      setAlertMessage("Failed to create booking.");
      setIsAlertOpen(true);
    }
  };

  // Calculate total amount based on room price and duration
  useEffect(() => {
    if (formData.roomNumber && rooms) {
      const selectedRoom = rooms.find(room => room.roomNumber === formData.roomNumber);
      if (selectedRoom && formData.checkIn && formData.checkOut) {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);

        // Calculate difference in time
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();

        // Calculate number of nights
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        // Ensure diffDays is a positive integer and at least 1 night
        const nights = Math.max(Math.floor(diffDays), 1); // Minimum 1 night

        const total = nights * selectedRoom.pricePerNight;
        console.log(`Nights: ${nights}, Price per Night: ${selectedRoom.pricePerNight}, Total: ${total}`);
        setFormData(prev => ({
          ...prev,
          totalAmount: total,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          totalAmount: 0,
        }));
      }
    }
  }, [formData.roomNumber, formData.checkIn, formData.checkOut, rooms]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white shadow-xl border-2 border-primary p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-secondary mb-6">Create a Reservation</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Room Selection */}
          <div className="mb-6">
            <label htmlFor="roomNumber" className="block text-secondary font-semibold mb-2">
              Select Room
            </label>
            {roomsError && <p className="text-red-600">Failed to load rooms.</p>}
            <select
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-800"
              required
            >
              <option value="">-- Select a Room --</option>
              {rooms && rooms.map(room => (
                <option key={room.roomNumber} value={room.roomNumber}>
                  {room.roomNumber} - {room.roomType} (${room.pricePerNight}/night)
                </option>
              ))}
            </select>
          </div>

          {/* Check-In and Check-Out */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="checkIn" className="block text-secondary font-semibold mb-2">
                Check-In
              </label>
              <Input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="checkOut" className="block text-secondary font-semibold mb-2">
                Check-Out
              </label>
              <Input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                required
              />
            </div>
          </div>

          {/* Number of Guests */}
          <div className="mb-6">
            <label htmlFor="numGuests" className="block text-secondary font-semibold mb-2">
              Number of Guests
            </label>
            <Input
              type="number"
              id="numGuests"
              name="numGuests"
              value={formData.numGuests}
              onChange={handleChange}
              min={1}
              className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              required
            />
          </div>

          {/* Total Amount */}
          <div className="mb-6">
            <label htmlFor="totalAmount" className="block text-secondary font-semibold mb-2">
              Total Amount ($)
            </label>
            <Input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              readOnly
              className="w-full p-3 border border-primary rounded-lg bg-gray-100 text-gray-700"
            />
          </div>

          {/* Guest Information */}
          <h2 className="text-3xl font-semibold text-secondary mb-4">Guest Information</h2>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guest.identification" className="block text-secondary font-semibold mb-2">
                Identification
              </label>
              <Input
                type="text"
                id="guest.identification"
                name="guest.identification"
                value={formData.guest.identification}
                onChange={handleChange}
                placeholder="e.g., 123456789"
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
                required
              />
            </div>
            <div>
              <label htmlFor="guest.documentType" className="block text-secondary font-semibold mb-2">
                Document Type
              </label>
              <select
                id="guest.documentType"
                name="guest.documentType"
                value={formData.guest.documentType}
                onChange={handleChange}
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-800"
                required
              >
                <option value="">-- Select Document Type --</option>
                <option value="ID">ID</option>
                <option value="Passport">Passport</option>
                <option value="Driver's License">Driver's License</option>
                {/* Add other document types as needed */}
              </select>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guest.firstName" className="block text-secondary font-semibold mb-2">
                First Name
              </label>
              <Input
                type="text"
                id="guest.firstName"
                name="guest.firstName"
                value={formData.guest.firstName}
                onChange={handleChange}
                placeholder="e.g., John"
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
                required
              />
            </div>
            <div>
              <label htmlFor="guest.lastName" className="block text-secondary font-semibold mb-2">
                Last Name
              </label>
              <Input
                type="text"
                id="guest.lastName"
                name="guest.lastName"
                value={formData.guest.lastName}
                onChange={handleChange}
                placeholder="e.g., Doe"
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="guest.email" className="block text-secondary font-semibold mb-2">
              Email
            </label>
            <Input
              type="email"
              id="guest.email"
              name="guest.email"
              value={formData.guest.email}
              onChange={handleChange}
              placeholder="e.g., john.doe@example.com"
              className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="guest.phone" className="block text-secondary font-semibold mb-2">
              Phone
            </label>
            <Input
              type="tel"
              id="guest.phone"
              name="guest.phone"
              value={formData.guest.phone}
              onChange={handleChange}
              placeholder="e.g., +1234567890"
              className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="guest.country" className="block text-secondary font-semibold mb-2">
              Country
            </label>
            <Input
              type="text"
              id="guest.country"
              name="guest.country"
              value={formData.guest.country}
              onChange={handleChange}
              placeholder="e.g., Colombia"
              className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>Create Reservation</span>
          </Button>
        </form>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        title="Reservation Error"
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
        type="error"
      />
    </div>
  );
}