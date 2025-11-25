import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  SearchSelectContent,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Country interface
interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export function CountrySelect({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const africanCountryCodes = [
          "NG",
          "EG",
          "ZA",
          "KE",
          "GH",
          "ET",
          "TZ",
          "UG",
          "DZ",
          "MA",
          "AO",
          "CM",
          "CI",
          "SN",
          "ZW",
          "SD",
          "LY",
          "TN",
          "ML",
          "BF",
          "NE",
          "TD",
          "MR",
          "ER",
          "DJ",
          "SO",
          "CF",
          "CG",
          "CD",
          "RW",
          "BI",
          "GM",
          "GW",
          "SL",
          "LR",
          "BJ",
          "TG",
          "GA",
          "GQ",
          "SC",
          "CV",
          "KM",
          "MG",
          "MU",
          "SZ",
          "LS",
          "BW",
          "NA",
          "MW",
          "ZM",
          "MZ",
          "ST",
        ];

        const africanCountries = data
          .filter((country: any) => africanCountryCodes.includes(country.cca2))
          .map((country: any) => {
            let dialCode = "";

            if (country.idd && country.idd.root) {
              const root = country.idd.root;
              const suffixes = country.idd.suffixes;

              if (root) {
                if (suffixes && suffixes.length > 0) {
                  if (suffixes.length === 1) {
                    dialCode = root + suffixes[0].toString();
                  } else {
                    dialCode = root;
                  }
                } else {
                  dialCode = root;
                }
              }
            }

            return {
              name: country.name.common || "",
              code: country.cca2 || "",
              dialCode: dialCode,
              flag: country.flag || "",
            };
          })
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(africanCountries);
      } catch (err) {
        setError("Failed to fetch countries");
        console.error("Error fetching countries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="min-h-11">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading countries...</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="min-h-11">
          <span>Error loading countries</span>
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="min-h-11">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SearchSelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SearchSelectContent>
    </Select>
  );
}
