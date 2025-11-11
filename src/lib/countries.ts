// lib/countries.ts

import React from "react";

export interface Country {
  name: string;
  code: string;
}

export interface City {
  name: string;
  countryCode: string;
}

// Mock data for African countries and cities
const africanCountries: Country[] = [
  { name: "Nigeria", code: "NG" },
  { name: "Egypt", code: "EG" },
  { name: "South Africa", code: "ZA" },
  { name: "Kenya", code: "KE" },
  { name: "Ghana", code: "GH" },
  { name: "Ethiopia", code: "ET" },
  { name: "Tanzania", code: "TZ" },
  { name: "Uganda", code: "UG" },
  { name: "Algeria", code: "DZ" },
  { name: "Morocco", code: "MA" },
  { name: "Angola", code: "AO" },
  { name: "Cameroon", code: "CM" },
  { name: "Ivory Coast", code: "CI" },
  { name: "Senegal", code: "SN" },
  { name: "Zimbabwe", code: "ZW" },
];

const cities: City[] = [
  // Nigeria
  { name: "Lagos", countryCode: "NG" },
  { name: "Abuja", countryCode: "NG" },
  { name: "Kano", countryCode: "NG" },
  { name: "Ibadan", countryCode: "NG" },
  { name: "Port Harcourt", countryCode: "NG" },
  
  // Egypt
  { name: "Cairo", countryCode: "EG" },
  { name: "Alexandria", countryCode: "EG" },
  { name: "Giza", countryCode: "EG" },
  { name: "Shubra El-Kheima", countryCode: "EG" },
  
  // South Africa
  { name: "Johannesburg", countryCode: "ZA" },
  { name: "Cape Town", countryCode: "ZA" },
  { name: "Durban", countryCode: "ZA" },
  { name: "Pretoria", countryCode: "ZA" },
  
  // Kenya
  { name: "Nairobi", countryCode: "KE" },
  { name: "Mombasa", countryCode: "KE" },
  { name: "Kisumu", countryCode: "KE" },
  { name: "Nakuru", countryCode: "KE" },
  
  // Ghana
  { name: "Accra", countryCode: "GH" },
  { name: "Kumasi", countryCode: "GH" },
  { name: "Tamale", countryCode: "GH" },
  { name: "Sekondi-Takoradi", countryCode: "GH" },
];

// Utility functions
export const countriesApi = {
  // Get all African countries
  getAfricanCountries: async (): Promise<Country[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return africanCountries;
  },

  // Get cities by country code
  getCitiesByCountry: async (countryCode: string): Promise<City[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return cities.filter(city => city.countryCode === countryCode);
  },

  // Search cities by country code and query
  searchCities: async (countryCode: string, query: string): Promise<City[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const filteredCities = cities.filter(city => 
      city.countryCode === countryCode && 
      city.name.toLowerCase().includes(query.toLowerCase())
    );
    return filteredCities;
  }
};

// Hook for using countries and cities
export const useCountries = () => {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await countriesApi.getAfricanCountries();
        setCountries(data);
      } catch (err) {
        setError('Failed to fetch countries');
        console.error('Error fetching countries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};