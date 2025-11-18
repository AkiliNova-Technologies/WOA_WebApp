// lib/countries.ts

import React from "react";

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface City {
  name: string;
  countryCode: string;
}

// Interfaces for the API response
interface CountryApiResponse {
  name: {
    common: string;
    official?: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  cca2: string;
  idd: {
    root: string;
    suffixes?: string[];
  };
  flag: string;
}

// Utility functions
export const countriesApi = {
  // Get all countries from the API
  getAllCountries: async (): Promise<Country[]> => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CountryApiResponse[] = await response.json();
      
      return data.map(country => {
        let dialCode = '';
        
        if (country.idd && country.idd.root) {
          const root = country.idd.root;
          const suffixes = country.idd.suffixes;

          if (root) {
            if (suffixes && suffixes.length > 0) {
              // If there's only one suffix, it's part of the country code (like Kenya +254)
              // If there are many suffixes, they're area codes, so use root only (like US +1)
              if (suffixes.length === 1) {
                dialCode = root + suffixes[0].toString();
              } else {
                // Multiple suffixes means area codes, use root only
                dialCode = root;
              }
            } else {
              dialCode = root;
            }
          }
        }

        return {
          name: country.name.common || '',
          code: country.cca2 || '',
          dialCode: dialCode,
          flag: country.flag || '',
        };
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw new Error('Failed to fetch countries from API');
    }
  },

  // Get African countries (filtered from all countries)
  getAfricanCountries: async (): Promise<Country[]> => {
    const allCountries = await countriesApi.getAllCountries();
    
    // List of African country codes for filtering
    const africanCountryCodes = [
      'NG', 'EG', 'ZA', 'KE', 'GH', 'ET', 'TZ', 'UG', 'DZ', 'MA',
      'AO', 'CM', 'CI', 'SN', 'ZW', 'SD', 'LY', 'TN', 'ML', 'BF',
      'NE', 'TD', 'MR', 'ER', 'DJ', 'SO', 'CF', 'CG', 'CD', 'RW',
      'BI', 'GM', 'GW', 'SL', 'LR', 'BJ', 'TG', 'GA', 'GQ', 'SC',
      'CV', 'KM', 'MG', 'MU', 'SZ', 'LS', 'BW', 'NA', 'MW', 'ZM',
      'MZ', 'ST'
    ];
    
    return allCountries.filter(country => 
      africanCountryCodes.includes(country.code)
    );
  },

  // Get cities by country code (mock data - you might want to replace this with a real API)
  getCitiesByCountry: async (countryCode: string): Promise<City[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock cities data - in a real app, you'd fetch this from another API
    const mockCities: City[] = [
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

    return mockCities.filter(city => city.countryCode === countryCode);
  },

  // Search cities by country code and query
  searchCities: async (countryCode: string, query: string): Promise<City[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const cities = await countriesApi.getCitiesByCountry(countryCode);
    
    return cities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    );
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

// Additional hook for getting all countries
export const useAllCountries = () => {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const data = await countriesApi.getAllCountries();
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