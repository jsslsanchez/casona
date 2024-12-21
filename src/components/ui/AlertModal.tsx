// components/ui/AlertModal.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: "error" | "success" | "info";
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  type = "error",
}) => {
  const icons = {
    error: <AlertCircle className="text-red-500 h-6 w-6" />,
    success: <CheckCircle className="text-green-500 h-6 w-6" />,
    info: <Info className="text-blue-500 h-6 w-6" />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-[#5E3023] border border-[#8B2500] rounded-lg p-6">
        <DialogHeader className="flex items-center space-x-2">
          {icons[type]}
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-4">{message}</DialogDescription>
        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="bg-[#8B2500] hover:bg-[#5E3023] text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};