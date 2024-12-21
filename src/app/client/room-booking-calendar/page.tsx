// /app/client/room-booking-calendar/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Loading from "@/components/Loading";
import { AlertModal } from "@/components/AlertModal";

export default function RoomBookingCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkInDateParam = searchParams.get("checkIn");
  const checkOutDateParam = searchParams.get("checkOut");
  const numGuestsParam = searchParams.get("numGuests") || "1";

  const [selectedRange, setSelectedRange] = useState<any>({
    from: checkInDateParam ? new Date(checkInDateParam) : undefined,
    to: checkOutDateParam ? new Date(checkOutDateParam) : undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleDateSelect = (range: any) => {
    setSelectedRange(range);
  };

  const handleBookNow = () => {
    if (selectedRange && selectedRange.from && selectedRange.to) {
      const checkIn = selectedRange.from.toISOString().split('T')[0];
      const checkOut = selectedRange.to.toISOString().split('T')[0];
      router.push(
        `/client/room-list?checkIn=${checkIn}&checkOut=${checkOut}&numGuests=${numGuestsParam}`
      );
    } else {
      setAlertMessage("Please select a valid date range to book.");
      setIsAlertOpen(true);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <Card className="max-w-4xl mx-auto bg-[#F7EDE2] shadow-lg border-2 border-[#8B2500]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#5E3023]">Room Booking Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-[#5E3023] p-4 rounded-lg shadow-inner border border-[#8B2500]">
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                className="rounded-md border border-[#8B2500] bg-[#F7EDE2] text-[#5E3023]"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#5E3023] mb-2">Selected Dates</h3>
                {selectedRange && selectedRange.from && selectedRange.to ? (
                  <p className="text-[#5E3023]">
                    From {format(selectedRange.from, "MMMM d, yyyy")} to{" "}
                    {format(selectedRange.to, "MMMM d, yyyy")}
                  </p>
                ) : (
                  <p className="text-[#5E3023]">No dates selected.</p>
                )}
              </div>
            </div>
          </div>
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
            onClick={handleBookNow}
            className="bg-[#8B2500] hover:bg-[#5E3023] text-white text-lg font-semibold transition-all duration-200"
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        title="Booking Error"
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
}