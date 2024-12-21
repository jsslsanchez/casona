// /app/client/room-details/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bed, Users } from "lucide-react";
import Loading from "@/components/Loading";
import { AlertModal } from "@/components/AlertModal";

interface Room {
  roomNumber: string;
  roomType: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  size: number;
  features: string;
  images: { url: string; displayOrder: number }[];
}

export default function RoomDetailsPage() {
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomNumber = searchParams.get("roomNumber") || "";
  const checkInDate = searchParams.get("checkIn") || "";
  const checkOutDate = searchParams.get("checkOut") || "";
  const numGuests = searchParams.get("numGuests") || "1";

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomNumber}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room details");
        }
        const data = await response.json();
        setRoomDetails(data);
      } catch (error) {
        console.error("Error fetching room details:", error);
        setAlertMessage("Failed to load room details. Please try again.");
        setIsAlertOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomNumber) {
      fetchRoomDetails();
    } else {
      setAlertMessage("Invalid room selection.");
      setIsAlertOpen(true);
      setIsLoading(false);
    }
  }, [roomNumber]);

  const nextImage = () => {
    if (roomDetails && roomDetails.images && roomDetails.images.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % roomDetails.images.length
      );
    }
  };

  const prevImage = () => {
    if (roomDetails && roomDetails.images && roomDetails.images.length > 0) {
      setCurrentImageIndex(
        (prevIndex) =>
          (prevIndex - 1 + roomDetails.images.length) % roomDetails.images.length
      );
    }
  };

  const handleBookingCalendarRedirect = () => {
    router.push(
      `/client/reservation-form?roomNumber=${roomNumber}&checkIn=${checkInDate}&checkOut=${checkOutDate}&numGuests=${numGuests}`
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EDE2]">
        <p className="text-[#5E3023]">Room details not available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#F7EDE2] shadow-lg border-2 border-[#8B2500]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-[#5E3023]">
                  {roomDetails.roomType} Room {roomDetails.roomNumber}
                </CardTitle>
                <CardDescription className="text-[#8B4B3B]">
                  {roomDetails.description}
                </CardDescription>
              </div>
              <Badge className="bg-[#8B2500] text-white text-lg py-1 px-3">
                {roomDetails.pricePerNight.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}/night
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              {roomDetails.images && roomDetails.images.length > 0 ? (
                <>
                  <img
                    src={roomDetails.images[currentImageIndex].url}
                    alt={`Room view ${currentImageIndex + 1}`}
                    className="w-full h-[400px] object-cover rounded-lg"
                  />
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                    <Button
                      onClick={prevImage}
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                      aria-label="Previous Image"
                    >
                      {"<"}
                    </Button>
                  </div>
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <Button
                      onClick={nextImage}
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/80 hover:bg-white"
                      aria-label="Next Image"
                    >
                      {">"}
                    </Button>
                  </div>
                </>
              ) : (
                <img
                  src={getImageForRoomType(roomDetails.roomType)}
                  alt={`${roomDetails.roomType} Room`}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              )}
            </div>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white rounded-md border border-[#8B2500]">
                <TabsTrigger
                  value="details"
                  className="text-[#5E3023] hover:bg-[#8B2500] hover:text-white data-[state=active]:text-[#8B2500]"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="text-[#5E3023] hover:bg-[#8B2500] hover:text-white data-[state=active]:text-[#8B2500]"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="text-[#5E3023] hover:bg-[#8B2500] hover:text-white data-[state=active]:text-[#8B2500]"
                >
                  Policies
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4 text-[#5E3023]">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="text-[#5E3023]" />
                    <span className="text-lg">
                      Capacity: {roomDetails.capacity} guests
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bed className="text-[#5E3023]" />
                    <span className="text-lg">
                      Room Size: {roomDetails.size} m²
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features" className="mt-4 text-[#5E3023]">
                <ul className="space-y-2">
                  {roomDetails.features.split(",").map((feature, index) => (
                    <li key={index} className="list-disc list-inside">
                      {feature.trim()}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="policies" className="mt-4 text-[#5E3023]">
                <ul className="space-y-2">
                  <li>Check-in: 3:00 PM</li>
                  <li>Check-out: 11:00 AM</li>
                  <li>No smoking</li>
                  <li>No pets allowed</li>
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-[#8B2500] text-[#8B2500] hover:bg-[#8B2500] hover:text-white"
            >
              Back
            </Button>
            <Button
              onClick={handleBookingCalendarRedirect}
              className="bg-[#8B2500] hover:bg-[#5E3023] text-white transition-all duration-200"
            >
              Book Now
            </Button>
          </CardFooter>
        </Card>
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

function getImageForRoomType(roomType: string): string {
  switch (roomType) {
    case "Double":
      return "/images/double-room.jpg";
    case "Family":
      return "/images/family-room.jpg";
    case "Suite":
      return "/images/suite-room.jpg";
    default:
      return "/images/double-room.jpg";
  }
}