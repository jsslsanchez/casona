// /app/admin/notifications/page.tsx

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Notification {
  id: number;
  type: string;
  message: string;
  status: string;
  date: string;
  details: string;
}

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const { data: notifications, error } = useSWR<Notification[]>('/api/notifications', fetcher);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
  };

  if (error) return <p className="text-red-500">Failed to load notifications.</p>;
  if (!notifications) return <p className="text-[#5E3023]">Loading notifications...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7] p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg border-2 border-[#8B2500]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#5E3023]">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-[#5E3023]">No notifications available</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white p-4 rounded-lg shadow-md border border-[#D9B99B] flex justify-between items-center cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div>
                    <p className="text-lg font-semibold text-[#5E3023]">{notification.message}</p>
                    <p className="text-sm text-[#8B4B3B]">{new Date(notification.date).toLocaleDateString()}</p>
                  </div>
                  <Badge
                    className={`${
                      notification.status === "New"
                        ? "bg-green-500"
                        : notification.status === "Completed"
                        ? "bg-blue-500"
                        : "bg-red-500"
                    } text-white`}
                  >
                    {notification.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-4">
          <Button
            onClick={() => router.back()}
            className="bg-[#8B2500] hover:bg-[#5E3023] text-white"
          >
            Back
          </Button>
        </div>

        {/* Notification Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hidden">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent className="bg-white text-[#5E3023] border border-[#8B2500]">
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
            </DialogHeader>
            <div>
              {selectedNotification && (
                <p>{selectedNotification.details}</p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} className="bg-[#8B2500] hover:bg-[#5E3023] text-white">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}