"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  isOpen?: boolean; // Added optional isOpen property for conditional rendering
}

export function Modal({ children, onClose, isOpen = true }: ModalProps) {
  // Render nothing if the modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Children */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}