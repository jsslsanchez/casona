// components/ui/alert.tsx

import { X } from "lucide-react";
import { useEffect } from "react";

interface AlertProps {
    message: string;
    onClose: () => void;
}

export function Alert({ message, onClose }: AlertProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000); // Auto-close after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[999]">
            <div className="relative flex items-center bg-white border border-gray-300 text-gray-700 px-6 py-4 rounded-lg shadow-lg max-w-md mx-auto space-x-3 z-[1000]">
                <span className="text-sm font-medium">{message}</span>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}