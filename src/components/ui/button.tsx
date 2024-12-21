// components/ui/button.tsx

import React from 'react';
import { cn } from '@/lib/utils'; // Utility for conditionally joining class names
import { Slot } from '@radix-ui/react-slot'; // Import Slot

export const buttonVariants = (variant: string = 'default', size: string = 'default') => {
  let sizeClasses;
  switch (size) {
    case 'sm':
      sizeClasses = 'w-28 h-8'; // Small button
      break;
    case 'lg':
      sizeClasses = 'w-44 h-14'; // Large button
      break;
    case 'icon':
      sizeClasses = 'w-12 h-12'; // Icon button
      break;
    default:
      sizeClasses = 'w-36 h-12'; // Default size
      break;
  }

  return cn(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizeClasses, // Size class depending on the 'size' prop
    {
      'bg-[#8B2500] text-white hover:bg-[#5E3023]': variant === 'primary',
      'bg-red-500 text-white hover:bg-red-700': variant === 'destructive',
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
      'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
      'text-primary underline-offset-4 hover:underline': variant === 'link',
      'border border-[#8B2500] text-[#8B2500] hover:bg-[#8B2500] hover:text-white': variant === 'outline',
    }
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean; // Add this prop to support Slot rendering
}

const Button: React.FC<ButtonProps> = ({ className, variant = 'default', size = 'default', asChild = false, ...props }) => {
  const Comp = asChild ? Slot : 'button'; // Conditionally render a 'Slot' if 'asChild' is true
  return (
    <Comp className={cn(buttonVariants(variant, size), className)} {...props} />
  );
};

Button.displayName = 'Button';

export { Button };