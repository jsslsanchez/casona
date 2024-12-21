// components/ui/FormField.tsx

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  children,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-[#5E3023] font-semibold">
      {label}
    </Label>
    {children ? (
      children
    ) : (
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white text-gray-800 border border-[#8B2500] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B2500]"
      />
    )}
  </div>
);