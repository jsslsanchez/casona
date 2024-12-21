// components/ui/IconButton.tsx

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  children,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={`flex items-center space-x-2 ${className}`}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Button>
  );
};