"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { africanCountryCodes } from "@/lib/african-country-codes";

export interface AfricanPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (countryCode: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function AfricanPhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  className,
  placeholder = "Phone number",
  disabled = false,
}: AfricanPhoneInputProps) {
  const [open, setOpen] = React.useState(false);

  // Set default to Nigeria if no country code is provided
  React.useEffect(() => {
    if (!countryCode) {
      onCountryCodeChange("+234"); // Nigeria as default
    }
  }, [countryCode, onCountryCodeChange]);

  const selectedCountry = africanCountryCodes.find(country => country.dial_code === countryCode) || africanCountryCodes[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove non-digits
    onChange(input);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove any existing formatting
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Format based on length (basic formatting)
    if (cleanPhone.length <= 3) return cleanPhone;
    if (cleanPhone.length <= 6) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`;
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 10)}`;
  };

  return (
    <div className={cn("flex border rounded-md", className)}>
      {/* Country Code Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[110px] justify-between h-11 border-none rounded-none bg-transparent hover:bg-transparent"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedCountry?.flag}</span>
              <span className="text-sm font-medium">{selectedCountry?.dial_code}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search African country..." 
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No African country found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {africanCountryCodes.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dial_code} ${country.flag}`}
                    onSelect={() => {
                      onCountryCodeChange(country.dial_code);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 cursor-pointer py-2"
                  >
                    <span className="text-lg shrink-0">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{country.name}</div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground shrink-0">
                      {country.dial_code}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        countryCode === country.dial_code
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <div className="flex-1">
        <Input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className="h-11 border-none"
          disabled={disabled}
        />
      </div>
    </div>
  );
}