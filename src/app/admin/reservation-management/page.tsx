// /app/admin/reservation-management/page.tsx

"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, PlusCircle, Search, UserPlus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import { Alert } from "@/components/ui/Alert";
import Image from "next/image";

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

interface NewReservation {
  guest: {
    identification: string;
    documentType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
  };
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
}

interface Guest {
  identification: string;
  documentType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  id: number;
}

export default function ReservationManagement() {
  const router = useRouter();
  const { data: reservations, error } = useSWR<Reservation[]>(
    "/api/bookings",
    fetcher
  );
  const { data: guests, error: guestsError } = useSWR<Guest[]>(
    "/api/guests",
    fetcher
  );
  const [newReservation, setNewReservation] = useState<NewReservation>({
    guest: {
      identification: "",
      documentType: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
    },
    roomNumber: "",
    checkIn: "",
    checkOut: "",
    numGuests: 1,
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [filterRoomType, setFilterRoomType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<{ roomNumber: string }[]>(
    []
  );
  const [selectedReservationId, setSelectedReservationId] = useState<
    number | null
  >(null);

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Fetch available rooms
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const response = await fetch("/api/rooms");
        if (response.ok) {
          const data = await response.json();
          setAvailableRooms(data);
        } else {
          setAvailableRooms([]);
        }
      } catch (error) {
        console.error("Error fetching available rooms:", error);
        setAvailableRooms([]);
      }
    };
    fetchAvailableRooms();
  }, []);

  // Handle guest selection
  const handleGuestSelect = (guest: Guest | null) => {
    if (guest) {
      setNewReservation({
        ...newReservation,
        guest: {
          identification: guest.identification,
          documentType: guest.documentType,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          country: guest.country || "",
        },
      });
      setSelectedGuest(guest);
    } else {
      // If 'New Guest' is selected, clear the guest details
      setNewReservation({
        ...newReservation,
        guest: {
          identification: "",
          documentType: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          country: "",
        },
      });
      setSelectedGuest(null);
    }
  };

  const handleAddReservation = async () => {
    // Basic validation
    const {
      guest: { identification, documentType, firstName, lastName, email, phone, country },
      roomNumber,
      checkIn,
      checkOut,
      numGuests,
    } = newReservation;

    if (
      !identification ||
      !documentType ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !roomNumber ||
      !checkIn ||
      !checkOut ||
      !numGuests
    ) {
      setAlertMessage("Please fill in all required fields.");
      return;
    }

    // Ensure check-out is after check-in and dates are not in the past
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today || checkOutDate <= checkInDate) {
      setAlertMessage(
        "Check-in date must be today or in the future, and check-out date must be after check-in date."
      );
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReservation),
      });

      if (response.ok) {
        setAlertMessage("Reservation added successfully!");
        mutate("/api/bookings"); // Revalidate SWR cache
        setNewReservation({
          guest: {
            identification: "",
            documentType: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            country: "",
          },
          roomNumber: "",
          checkIn: "",
          checkOut: "",
          numGuests: 1,
        });
        setIsDialogOpen(false);
        setSelectedGuest(null);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error adding reservation:", error);
      setAlertMessage("An error occurred while adding the reservation.");
    }
  };

  const handleDeleteReservation = async () => {
    if (selectedReservationId === null) return;

    try {
      const response = await fetch(`/api/bookings/${selectedReservationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAlertMessage("Reservation cancelled successfully!");
        mutate("/api/bookings"); // Revalidate SWR cache
        setSelectedReservationId(null);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || "Failed to cancel reservation.");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      setAlertMessage("An error occurred while cancelling the reservation.");
    }
  };

  if (error) return <p className="text-red-500">Error loading reservations.</p>;
  if (!reservations)
    return <p className="text-[#5E3023]">Loading reservations...</p>;
  if (guestsError)
    return <p className="text-red-500">Error loading guests.</p>;
  if (!guests)
    return <p className="text-[#5E3023]">Loading guests...</p>;

  // Filter reservations based on selected criteria
  const filteredReservations = reservations.filter(
    (reservation) =>
      (filterRoomType === "all" || reservation.room.roomType === filterRoomType) &&
      (filterStatus === "all" || reservation.status === filterStatus) &&
      (searchTerm === "" ||
        `${reservation.guest.firstName} ${reservation.guest.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
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
            <p className="text-2xl text-[#8B4B3B]">Reservation Management</p>
          </div>
          <Button
            onClick={() => router.push("/admin/notifications")}
            size="icon"
            className="absolute top-0 right-0 bg-[#8B2500] hover:bg-[#5E3023] text-white rounded-full p-2"
          >
            <Bell className="w-6 h-6" />
          </Button>
        </header>
        {alertMessage && (
          <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
        )}
        <div className="flex gap-8">
          <aside className="w-64 hidden md:block bg-[#F7EDE2] p-4 rounded-lg shadow-md border-2 border-[#8B2500]">
            <h2 className="text-xl font-semibold text-[#5E3023] mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-[#8B4B3B]">
                  Search by Guest Name
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#8B4B3B]" />
                  <Input
                    id="search"
                    placeholder="Guest name..."
                    className="pl-8 bg-white text-[#5E3023] border border-[#8B2500]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filterRoomType" className="text-[#8B4B3B]">
                  Room Type
                </Label>
                <Select
                  value={filterRoomType}
                  onValueChange={setFilterRoomType}
                >
                  <SelectTrigger
                    id="filterRoomType"
                    className="bg-white text-[#5E3023] border border-[#8B2500]"
                  >
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
              <div>
                <Label htmlFor="filterStatus" className="text-[#8B4B3B]">
                  Status
                </Label>
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger
                    id="filterStatus"
                    className="bg-white text-[#5E3023] border border-[#8B2500]"
                  >
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => router.push("/admin/room-management")}
                  className="bg-[#8B2500] hover:bg-[#5E3023] text-white w-32 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Rooms
                </Button>
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <div className="grid gap-6">
              {filteredReservations.length === 0 ? (
                <p className="text-center text-[#5E3023]">
                  No reservations found.
                </p>
              ) : (
                filteredReservations.map((reservation) => (
                  <Card
                    key={reservation.id}
                    className="bg-[#F7EDE2] shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#8B2500]"
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold text-[#5E3023] flex items-center gap-2">
                        <UserPlus className="w-6 h-6" />
                        {reservation.guest.firstName} {reservation.guest.lastName} - Room{" "}
                        {reservation.room.roomNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#8B4B3B]">
                        Room Type: {reservation.room.roomType}
                      </p>
                      <p className="text-[#8B4B3B]">
                        Room Number: {reservation.room.roomNumber}
                      </p>
                      <p className="text-[#8B4B3B]">
                        Check-in: {new Date(reservation.checkIn).toLocaleDateString()}
                      </p>
                      <p className="text-[#8B4B3B]">
                        Check-out: {new Date(reservation.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-[#8B4B3B]">Guests: {reservation.numGuests}</p>
                      <p className="text-[#8B4B3B]">Status: {reservation.status}</p>
                      <p className="text-[#8B4B3B]">
                        Guest Email: {reservation.guest.email}
                      </p>
                      <p className="text-[#8B4B3B]">
                        Total Amount: ${reservation.totalAmount}
                      </p>
                      <p className="text-[#8B4B3B]">
                        Payment Status: {reservation.paymentStatus}
                      </p>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                      {/* Update Reservation Button */}
                      <Button
                        onClick={() =>
                          router.push(`/admin/update-reservation/${reservation.id}`)
                        }
                        className="bg-[#8B2500] hover:bg-[#5E3023] text-white w-32 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Update
                      </Button>

                      {/* Cancel Reservation Button */}
                      <Dialog
                        open={selectedReservationId === reservation.id}
                        onOpenChange={(open) => {
                          if (!open) setSelectedReservationId(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className={`bg-red-500 hover:bg-red-700 text-white w-32 flex items-center justify-center gap-2 ${
                              reservation.status === "Cancelled"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={reservation.status === "Cancelled"}
                            onClick={() => setSelectedReservationId(reservation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-[#5E3023] border border-[#8B2500] rounded-lg p-6">
                          <DialogHeader>
                            <DialogTitle>Confirm Cancellation</DialogTitle>
                            <p>
                              Are you sure you want to cancel this reservation? This
                              action cannot be undone.
                            </p>
                          </DialogHeader>
                          <DialogFooter className="flex justify-end space-x-4">
                            <Button
                              variant="outline"
                              className="border-[#8B2500] text-[#8B2500] hover:bg-[#8B2500] hover:text-white w-32 flex items-center justify-center gap-2"
                              onClick={() => setSelectedReservationId(null)}
                            >
                              <UserPlus className="w-4 h-4" />
                              No
                            </Button>
                            <Button
                              variant="destructive"
                              className="bg-red-500 hover:bg-red-700 text-white w-32 flex items-center justify-center gap-2"
                              onClick={handleDeleteReservation}
                            >
                              <Trash2 className="w-4 h-4" />
                              Yes, Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))
              )}
              {/* Add New Reservation Card */}
              <Card
                className="bg-[#F7EDE2] shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#8B2500] cursor-pointer flex items-center justify-center h-40"
                onClick={() => setIsDialogOpen(true)}
              >
                <div className="flex flex-col items-center">
                  <PlusCircle className="w-12 h-12 text-[#8B2500] mb-2" />
                  <span className="text-xl font-semibold text-[#8B2500]">
                    Add New Reservation
                  </span>
                </div>
              </Card>
            </div>
          </main>
        </div>

        {/* Add New Reservation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hidden">Open</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#F7EDE2] text-[#5E3023] border border-[#8B2500] p-6 rounded-lg overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Reservation</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4 py-4">
              {/* Guest Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="selectGuest" className="text-right">
                  Guest
                </Label>
                <Select
                  value={selectedGuest ? selectedGuest.identification : "new"}
                  onValueChange={(value) => {
                    if (value === "new") {
                      handleGuestSelect(null);
                    } else {
                      const guest =
                        guests.find((g) => g.identification === value) || null;
                      handleGuestSelect(guest);
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]">
                    <SelectValue placeholder="Select existing guest or add new" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    <SelectItem value="new">New Guest</SelectItem>
                    {guests.map((guest) => (
                      <SelectItem
                        key={guest.id}
                        value={guest.identification}
                      >
                        {guest.identification} - {guest.firstName} {guest.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Identification */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="identification" className="text-right">
                  Identification
                </Label>
                <Input
                  id="identification"
                  value={newReservation.guest.identification}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        identification: e.target.value,
                      },
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                  placeholder="Enter identification"
                  disabled={selectedGuest !== null}
                />
              </div>

              {/* Document Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="documentType" className="text-right">
                  Document Type
                </Label>
                <Select
                  value={newReservation.guest.documentType}
                  onValueChange={(value) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        documentType: value,
                      },
                    })
                  }
                  required
                  disabled={selectedGuest !== null}
                >
                  <SelectTrigger className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Citizenship_ID">Citizenship ID</SelectItem>
                    <SelectItem value="Driver_License">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* First Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={newReservation.guest.firstName}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        firstName: e.target.value,
                      },
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                  placeholder="Enter first name"
                  disabled={selectedGuest !== null}
                />
              </div>

              {/* Last Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={newReservation.guest.lastName}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        lastName: e.target.value,
                      },
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                  placeholder="Enter last name"
                  disabled={selectedGuest !== null}
                />
              </div>

              {/* Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newReservation.guest.email}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        email: e.target.value,
                      },
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                  placeholder="Enter email"
                  disabled={selectedGuest !== null}
                />
              </div>

              {/* Phone */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newReservation.guest.phone}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                  placeholder="Enter phone number"
                  disabled={selectedGuest !== null}
                />
              </div>

              {/* Country */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={newReservation.guest.country}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      guest: {
                        ...newReservation.guest,
                        country: e.target.value,
                      },
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  placeholder="Enter country"
                  disabled={selectedGuest !== null}
                />
              </div>

              {/* Room Number */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomNumber" className="text-right">
                  Room Number
                </Label>
                <Select
                  value={newReservation.roomNumber}
                  onValueChange={(value) =>
                    setNewReservation({ ...newReservation, roomNumber: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]">
                    <SelectValue placeholder="Select room number" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    {availableRooms.map((room) => (
                      <SelectItem key={room.roomNumber} value={room.roomNumber}>
                        {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="checkIn" className="text-right">
                  Check-in
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={newReservation.checkIn}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, checkIn: e.target.value })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                />
              </div>

              {/* Check-out */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="checkOut" className="text-right">
                  Check-out
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={newReservation.checkOut}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, checkOut: e.target.value })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                />
              </div>

              {/* Number of Guests */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numGuests" className="text-right">
                  Number of Guests
                </Label>
                <Input
                  id="numGuests"
                  name="numGuests"
                  type="number"
                  min="1"
                  value={newReservation.numGuests}
                  onChange={(e) =>
                    setNewReservation({
                      ...newReservation,
                      numGuests: parseInt(e.target.value) || 1,
                    })
                  }
                  className="col-span-3 bg-white text-[#5E3023] border border-[#8B2500]"
                  required
                />
              </div>

              {/* Error Message */}
              {alertMessage && (
                <p className="text-red-500 text-center">{alertMessage}</p>
              )}

              {/* Submit Button */}
              <div className="flex justify-center mt-4">
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleAddReservation}
                    className="bg-[#8B2500] hover:bg-[#5E3023] text-white flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Reservation
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}