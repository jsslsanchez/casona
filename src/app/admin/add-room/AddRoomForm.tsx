// /app/admin/add-room/AddRoomForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/Alert"; // Use the existing Alert component

interface Room {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  size: number;
  features: string;
  description?: string;
}

export default function AddRoomForm() {
  const router = useRouter();
  const [room, setRoom] = useState<Room>({
    roomNumber: "",
    roomType: "Single",
    pricePerNight: 0,
    capacity: 1,
    size: 0,
    features: "",
    description: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRoom((prev) => ({
      ...prev,
      [name]:
        name === "pricePerNight" || name === "capacity" || name === "size"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setRoom((prev) => ({ ...prev, roomType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (
      !room.roomNumber ||
      !room.roomType ||
      room.pricePerNight === 0 ||
      room.capacity === 0 ||
      room.size === 0 ||
      !room.features
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Room added successfully!");
        // Optionally, reset the form
        setRoom({
          roomNumber: "",
          roomType: "Single",
          pricePerNight: 0,
          capacity: 1,
          size: 0,
          features: "",
          description: "",
        });
        // Redirect after a short delay to allow users to see the success message
        setTimeout(() => {
          router.push("/admin/room-management");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      setError("An error occurred while adding the room.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <Card className="max-w-2xl mx-auto bg-[#F7EDE2] shadow-lg border-2 border-[#8B2500]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#5E3023]">
            Add New Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display Success or Error Messages */}
          {success && <Alert message={success} onClose={() => setSuccess("")} />}
          {error && <Alert message={error} onClose={() => setError("")} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="text-[#8B4B3B]">
                Room Number
              </Label>
              <Input
                id="roomNumber"
                name="roomNumber"
                type="text"
                placeholder="Enter room number"
                value={room.roomNumber}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                required
              />
            </div>
            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="roomType" className="text-[#8B4B3B]">
                Room Type
              </Label>
              <Select value={room.roomType} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full bg-white text-[#5E3023] border border-[#8B2500]">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent className="bg-[#F7EDE2] text-[#5E3023]">
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-[#8B4B3B]">
                Capacity
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="Enter room capacity"
                value={room.capacity}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                required
              />
            </div>
            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size" className="text-[#8B4B3B]">
                Size (sqm)
              </Label>
              <Input
                id="size"
                name="size"
                type="number"
                min="0"
                placeholder="Enter room size in square meters"
                value={room.size}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                required
              />
            </div>
            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features" className="text-[#8B4B3B]">
                Features (comma-separated)
              </Label>
              <Input
                id="features"
                name="features"
                type="text"
                placeholder="Enter features separated by commas (e.g., WiFi,AirConditioning)"
                value={room.features}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                required
              />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#8B4B3B]">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter room description"
                value={room.description}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
              />
            </div>
            {/* Rate per Night */}
            <div className="space-y-2">
              <Label htmlFor="pricePerNight" className="text-[#8B4B3B]">
                Rate per Night ($)
              </Label>
              <Input
                id="pricePerNight"
                name="pricePerNight"
                type="number"
                min="0"
                placeholder="Enter rate per night"
                value={room.pricePerNight}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                required
              />
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.push("/admin/room-management")}
                variant="outline"
                className="bg-red-500 border-[#8B2500] text-white hover:bg-red-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#8B2500] hover:bg-[#5E3023] text-white"
              >
                Add Room
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
