// /app/admin/room-management/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, PlusCircle, Search, Trash2, Edit, User, Home } from 'lucide-react';
import Image from 'next/image';
import { Alert } from '@/components/ui/Alert'; // Import Alert component
import { Modal } from '@/components/ui/modal'; // Import your Modal component

interface Room {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  size: number;
  features: string;
  description?: string;
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [roomToDelete, setRoomToDelete] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Fetch rooms from backend
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to fetch rooms.');
      }
    };

    fetchRooms();
  }, []);

  // Function to open the deletion confirmation modal
  const openDeleteModal = (roomNumber: string) => {
    setRoomToDelete(roomNumber);
    setIsModalOpen(true);
  };

  // Function to handle room deletion
  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      const response = await fetch(`/api/rooms/${roomToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRooms(rooms.filter((room) => room.roomNumber !== roomToDelete));
        setSuccess('Room deleted successfully.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete room.');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('An error occurred while deleting the room.');
    } finally {
      setIsModalOpen(false);
      setRoomToDelete('');
    }
  };

  // Filter rooms based on type and search term
  const filteredRooms = rooms.filter(
    (room) =>
      (filterType === 'all' || room.roomType === filterType) &&
      (searchTerm === '' || room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center relative flex items-center justify-center">
          <Image
            src="/images/icon_48x48.png" // Ensure this path matches your logo's location in /public/images/
            alt="Company Logo"
            width={48} // Adjust size as needed
            height={48}
            className="mr-4"
          />
          <div>
            <h1 className="text-5xl font-bold text-[#5E3023] mb-2">Casona</h1>
            <p className="text-2xl text-[#8B4B3B]">Room Management</p>
          </div>
          <Button
            onClick={() => router.push("/admin/notifications")}
            size="icon"
            className="absolute top-0 right-0 bg-[#8B2500] hover:bg-[#5E3023] text-white rounded-full p-2"
          >
            <Bell className="w-6 h-6" />
          </Button>
        </header>
        <div className="flex gap-8">
          <aside className="w-64 hidden md:block bg-[#F7EDE2] p-4 rounded-lg shadow-md border-2 border-[#8B2500]">
            <h2 className="text-xl font-semibold text-[#5E3023] mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-[#8B4B3B]">
                  Search by Room Number
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#8B4B3B]" />
                  <Input
                    id="search"
                    placeholder="Room number..."
                    className="pl-8 bg-white text-[#5E3023] border border-[#8B2500]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filterType" className="text-[#8B4B3B]">
                  Room Type
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filterType" className="bg-white text-[#5E3023] border border-[#8B2500]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => router.push('/admin/reservation-management')}
                  className="bg-[#8B2500] hover:bg-[#5E3023] text-white w-32 flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Reservations
                </Button>
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <div className="grid gap-6">
              {filteredRooms.length === 0 ? (
                <p className="text-center text-[#5E3023]">No rooms found.</p>
              ) : (
                filteredRooms.map((room) => (
                  <Card
                    key={room.roomNumber}
                    className="bg-[#F7EDE2] shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#8B2500]"
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold text-[#5E3023] flex items-center gap-2">
                        <Home className="w-6 h-6" />
                        Room {room.roomNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#8B4B3B]">Type: {room.roomType}</p>
                      <p className="text-[#8B4B3B]">Capacity: {room.capacity}</p>
                      <p className="text-[#8B4B3B]">Price per Night: ${room.pricePerNight}</p>
                      {room.description && <p className="text-[#8B4B3B]">Description: {room.description}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        onClick={() => router.push(`/admin/update-room/${room.roomNumber}`)}
                        className="bg-[#8B2500] hover:bg-[#5E3023] text-white flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </Button>
                      <Button
                        onClick={() => openDeleteModal(room.roomNumber)}
                        className="bg-red-500 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Room
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
              {/* Add New Room Card */}
              <Card
                className="bg-[#F7EDE2] shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#8B2500] cursor-pointer flex items-center justify-center h-40"
                onClick={() => router.push('/admin/add-room')}
              >
                <div className="flex flex-col items-center">
                  <PlusCircle className="w-12 h-12 text-[#8B2500] mb-2" />
                  <span className="text-xl font-semibold text-[#8B2500]">
                    Add New Room
                  </span>
                </div>
              </Card>
            </div>
          </main>
        </div>

        {/* Error Alert */}
        {error && <Alert message={error} onClose={() => setError('')} />}

        {/* Success Alert */}
        {success && <Alert message={success} onClose={() => setSuccess('')} />}

        {/* Delete Confirmation Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#5E3023] mb-4">Confirm Deletion</h2>
              <p className="text-[#8B4B3B]">Are you sure you want to delete room {roomToDelete}? This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-4">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="bg-red-500 border-[#8B2500] text-white hover:bg-red-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRoom}
                  className="bg-[#8B2500] hover:bg-[#5E3023] text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
