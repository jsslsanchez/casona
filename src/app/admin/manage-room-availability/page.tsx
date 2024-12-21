// /app/admin/manage-room-availability/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/Alert";
import { format, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

type AvailabilityStatus = "Available" | "Booked" | "Under Maintenance";

interface Availability {
  date: string;
  status: AvailabilityStatus;
}

export default function ManageRoomAvailability() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [bulkStatus, setBulkStatus] = useState<AvailabilityStatus>("Available");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Automatically close alert after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Fetch existing availability data from the backend
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch("/api/room-availability");
        if (response.ok) {
          const data: Availability[] = await response.json();
          setAvailabilityData(data);
        } else {
          setAvailabilityData([]);
        }
      } catch (error) {
        console.error("Error fetching availability data:", error);
        setAvailabilityData([]);
      }
    };
    fetchAvailability();
  }, []);

  const handleStatusUpdate = async () => {
    if (!startDate || !endDate) {
      setAlertMessage("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setAlertMessage("Start date cannot be after end date.");
      return;
    }

    // Generate dates between startDate and endDate
    const dates = [];
    let currentDate = start;
    while (currentDate <= end) {
      dates.push(format(currentDate, "yyyy-MM-dd"));
      currentDate = addDays(currentDate, 1);
    }

    try {
      const response = await fetch("/api/room-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates, status: bulkStatus }),
      });

      if (response.ok) {
        setAlertMessage("Room availability updated successfully!");
        // Fetch the updated availability data
        const updatedData: Availability[] = await response.json();
        setAvailabilityData(updatedData);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || "Failed to update availability.");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      setAlertMessage("An error occurred while updating availability.");
    }
  };

  const statusColors: Record<AvailabilityStatus, string> = {
    Available: "text-green-600",
    Booked: "text-red-600",
    "Under Maintenance": "text-yellow-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <div className="max-w-4xl mx-auto">
        {alertMessage && <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />}
        <Card className="bg-[#F7EDE2] shadow-lg border-2 border-[#8B2500]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#5E3023]">Manage Room Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Date Range Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-[#5E3023]">Start Date</Label>
                  <Input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-[#8B2500] text-[#5E3023]"
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-[#5E3023]">End Date</Label>
                  <Input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-[#8B2500] text-[#5E3023]"
                    min={startDate || format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <h3 className="text-lg font-semibold text-[#5E3023] mb-2">Set Availability Status</h3>
                <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as AvailabilityStatus)}>
                  <SelectTrigger className="w-full bg-white border border-[#8B2500] text-[#5E3023]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-[#5E3023]">
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Booked">Booked</SelectItem>
                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Update Button */}
              <Button
                onClick={handleStatusUpdate}
                className="w-full bg-[#8B2500] hover:bg-[#5E3023] text-white shadow-md hover:shadow-lg transition-all duration-200 active:transform active:translate-y-0.5"
              >
                Update Availability
              </Button>

              {/* Existing Availability Data */}
              <div>
                <h3 className="text-lg font-semibold text-[#5E3023] mb-2">Current Availability</h3>
                {availabilityData.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-[#8B2500] py-2 text-[#5E3023]">Date</th>
                        <th className="border-b border-[#8B2500] py-2 text-[#5E3023]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availabilityData
                        .sort((a, b) => (a.date > b.date ? 1 : -1))
                        .map((item) => (
                          <tr key={item.date}>
                            <td className="border-b border-[#8B2500] py-2 text-[#5E3023]">
                              {format(new Date(item.date), "MMMM d, yyyy")}
                            </td>
                            <td className="border-b border-[#8B2500] py-2">
                              <span className={`font-semibold ${statusColors[item.status]}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[#5E3023]">No availability data available.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}