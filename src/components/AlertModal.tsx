// /components/AlertModal.tsx

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function AlertModal({ isOpen, title, message, onClose }: AlertModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-[#8B2500] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#5E3023]">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-[#5E3023] mt-4">{message}</p>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="bg-[#8B2500] text-white hover:bg-[#5E3023]">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
