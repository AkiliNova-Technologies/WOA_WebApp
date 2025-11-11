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

export interface Country {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (countryCode: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

// Enhanced default countries with proper flag emojis
const defaultCountries: Country[] = [
  { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
  { code: "NG", name: "Nigeria", dial_code: "+234", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", dial_code: "+233", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", dial_code: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", dial_code: "+27", flag: "🇿🇦" },
  { code: "ET", name: "Ethiopia", dial_code: "+251", flag: "🇪🇹" },
  { code: "EG", name: "Egypt", dial_code: "+20", flag: "🇪🇬" },
  { code: "CM", name: "Cameroon", dial_code: "+237", flag: "🇨🇲" },
  { code: "CI", name: "Ivory Coast", dial_code: "+225", flag: "🇨🇮" },
];

// Function to get flag emoji from country code
const getFlagEmoji = (countryCode: string) => {
  // Convert country code to flag emoji using regional indicator symbols
  return countryCode
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

export function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  className,
  placeholder = "Phone number",
  disabled = false,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [countries, setCountries] = React.useState<Country[]>(defaultCountries);
  const [loading, setLoading] = React.useState(false);

  // Fetch countries from API on component mount
  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        
        // Use a different approach - fetch from a service that provides dial codes
        const response = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name,idd");
        
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        
        const data = await response.json();
        
        // Process the data to create proper country objects
        const formattedCountries: Country[] = data
          .filter((country: any) => {
            // Filter countries that have valid dial codes
            return country.idd?.root && country.idd?.suffixes?.[0];
          })
          .map((country: any) => {
            const dial_code = country.idd.root + (country.idd.suffixes[0] || "");
            const flag = getFlagEmoji(country.cca2);
            
            return {
              code: country.cca2,
              name: country.name.common,
              dial_code: dial_code,
              flag: flag,
            };
          })
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to default countries if API fails
        setCountries(defaultCountries);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const selectedCountry = countries.find(country => country.dial_code === countryCode) || countries[0];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove non-digits
    onChange(input);
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting - you can customize this based on country patterns
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)}`;
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Country Code Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[140px] justify-between h-11 border-input bg-transparent hover:bg-transparent"
            disabled={disabled || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry?.flag}</span>
                <span className="text-sm font-medium">{selectedCountry?.dial_code}</span>
              </div>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search country..." 
              className="h-9"
            />
            <CommandList className="max-h-64">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
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
                    <span className="flex-1 text-sm font-medium">{country.name}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {country.dial_code}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
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
          className="h-11"
          disabled={disabled}
        />
      </div>
    </div>
  );
}