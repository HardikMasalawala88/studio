// components/cases/OppositeAdvocateAutocomplete.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OppositeAdvocateAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}

export default function OppositeAdvocateAutocomplete({
  value,
  onChange,
  options,
  disabled,
}: OppositeAdvocateAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        disabled={disabled}
        placeholder="Type or select an advocate"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      />
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-40 overflow-auto">
          {options
            .filter(
              (opt) =>
                opt.toLowerCase().includes(inputValue.toLowerCase()) &&
                opt !== inputValue
            )
            .map((opt) => (
              <div
                key={opt}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                onMouseDown={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
