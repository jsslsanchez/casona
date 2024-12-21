// /app/client/room-list/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Loading from "@/components/Loading";
import { AlertModal } from "@/components/AlertModal";

interface Room {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters
  const checkInDate = searchParams.get("checkIn") || "";
  const checkOutDate = searchParams.get("checkOut") || "";
  const numGuests = searchParams.get("numGuests") || "1";

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(
          `/api/rooms?checkIn=${checkInDate}&checkOut=${checkOutDate}&numGuests=${numGuests}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setAlertMessage("Failed to load available rooms. Please try again.");
        setIsAlertOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [checkInDate, checkOutDate, numGuests]);

  const handleSeeDetails = (roomNumber: string) => {
    // Pass along the booking details as query parameters
    router.push(
      `/client/room-details?roomNumber=${roomNumber}&checkIn=${checkInDate}&checkOut=${checkOutDate}&numGuests=${numGuests}`
    );
  };

  const getImageForRoomType = (roomType: string): string => {
    switch (roomType) {
      case "Single":
        return "/images/single-room.jpg";
      case "Double":
        return "/images/double-room.jpg";
      case "Family":
        return "/images/family-room.jpg";
      case "Suite":
        return "/images/suite-room.jpg";
      default:
        return "/images/default-room.jpg";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-center mb-12">
        <img
            src="/icon_192x192.png"
            alt="Company Logo"
            width={120}
            height={100}
            className="mr-8 rounded-xl"
          />
          <div className="text-center">
            <h1 className="text-5xl font-bold text-[#5E3023]">Casona</h1>
            <p className="text-2xl text-[#8B4B3B]">Lili's Bookings</p>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {rooms.length === 0 ? (
            <p className="text-center text-[#5E3023] col-span-full">No rooms available for the selected dates.</p>
          ) : (
            rooms.map((room) => (
              <Card
              key={room.roomNumber}
              className="bg-[#F7EDE2] shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#8B2500]"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-[#5E3023]">
                  {room.roomType} Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#8B4B3B] mb-4">Capacity: {room.capacity} guests</p>
                <Image
                  src={getImageForRoomType(room.roomType)}
                  alt={`${room.roomType} Room`}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-4">
                {/* Precio por noche */}
                <span className="text-xl font-bold text-[#5E3023]">
                  {room.pricePerNight.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </span>
                {/* Botón de detalles */}
                <Button
                  className="bg-[#8B2500] hover:bg-[#5E3023] text-white transition-all duration-200"
                  onClick={() => handleSeeDetails(room.roomNumber)}
                >
                  See Details
                </Button>
              </CardFooter>
            </Card>            
            ))
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        title="Error"
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
}