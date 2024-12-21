// /app/admin/update-room/[id]/UpdateRoomForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/Alert'; // Existing Alert component
import { Modal } from '@/components/ui/modal'; // Your customized Modal component

interface UpdateRoomFormProps {
  roomNumber: string;
}

interface Room {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  size: number;
  features: string;
  description?: string;
}

export default function UpdateRoomForm({ roomNumber }: UpdateRoomFormProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room>({
    roomNumber: '',
    roomType: 'Single',
    pricePerNight: 0,
    capacity: 1,
    size: 0,
    features: '',
    description: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal state

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomNumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch room data');
        }
        const data = await response.json();
        setRoom({
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          pricePerNight: data.pricePerNight,
          capacity: data.capacity,
          size: data.size,
          features: data.features,
          description: data.description || '',
        });
      } catch (error) {
        console.error('Error fetching room:', error);
        setError('Failed to fetch room data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomNumber]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRoom((prev) => ({
      ...prev,
      [name]:
        name === 'pricePerNight' || name === 'capacity' || name === 'size'
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setRoom((prev) => ({ ...prev, roomType: value }));
  };

  const handleSubmit = async () => {
    // Close the modal before submission
    setIsModalOpen(false);
    setError('');
    setSuccess('');

    // Basic validation
    if (
      !room.roomNumber ||
      !room.roomType ||
      room.pricePerNight === 0 ||
      room.capacity === 0 ||
      room.size === 0 ||
      !room.features
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });

      if (response.ok) {
        setSuccess('Room updated successfully!');
        // Redirect after a short delay to allow users to see the success message
        setTimeout(() => {
          router.push('/admin/room-management');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      setError('An error occurred while updating the room.');
    }
  };

  if (loading) {
    return <p className="text-center text-[#5E3023]">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <Card className="max-w-2xl mx-auto bg-[#F7EDE2] shadow-lg border-2 border-[#8B2500]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#5E3023]">
            Update Room Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display Success or Error Alerts */}
          {success && <Alert message={success} onClose={() => setSuccess('')} />}
          {error && <Alert message={error} onClose={() => setError('')} />}

          <form className="space-y-6">
            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="text-[#8B4B3B]">
                Room Number
              </Label>
              <Input
                id="roomNumber"
                name="roomNumber"
                type="text"
                value={room.roomNumber}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                disabled
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

            {/* Price per Night */}
            <div className="space-y-2">
              <Label htmlFor="pricePerNight" className="text-[#8B4B3B]">
                Price per Night ($)
              </Label>
              <Input
                id="pricePerNight"
                name="pricePerNight"
                type="number"
                min="0"
                placeholder="Enter price per night"
                value={room.pricePerNight}
                onChange={handleInputChange}
                className="w-full bg-white text-[#5E3023] border border-[#8B2500]"
                required
              />
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.push('/admin/room-management')}
                variant="outline"
                className="bg-red-500 border-[#8B2500] text-white hover:bg-red-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-[#8B2500] hover:bg-[#5E3023] text-white"
              >
                Update Room
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Update Confirmation Modal */}
        <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#5E3023] mb-4">Confirm Update</h2>
            <p className="text-[#8B4B3B]">
              Are you sure you want to update the details of room {room.roomNumber}?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="bg-red-500 border-[#8B2500] text-white hover:bg-red-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#8B2500] hover:bg-[#5E3023] text-white"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
}
