// Update your lib/countries.ts file

export interface Country {
  name: string;
  code: string;
}

export interface City {
  name: string;
  countryCode?: string;
}

const BASE_URL = "https://countriesnow.space/api/v0.1";

export const countriesApi = {
  async getAfricanCountries(): Promise<Country[]> {
    try {
      // Method 1: Try the continent endpoint first (POST request)
      try {
        const res = await fetch(`${BASE_URL}/countries/continent`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ continent: "Africa" }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json?.data && !json.error) {
            return json.data.map((c: any) => ({
              name: c.name,
              code: c.iso2 || c.iso3 || c.name.substring(0, 2).toUpperCase(),
            }));
          }
        }
      } catch (postError) {
        console.log("POST to /countries/continent failed, trying GET");
      }

      // Method 2: Get all countries and filter locally
      const res = await fetch(`${BASE_URL}/countries`, {
        headers: { 
          "Accept": "application/json"
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (!json?.data) {
        // Final fallback to static list
        return this.getStaticAfricanCountries();
      }

      // IMPORTANT: The response doesn't have continent info in this endpoint
      // So we need to get all African countries from the static list
      const staticCountries = this.getStaticAfricanCountries();
      
      // Filter the API response to only include countries from our static list
      const africanCountries = json.data
        .filter((country: any) => 
          staticCountries.some(staticCountry => 
            staticCountry.name.toLowerCase() === country.country.toLowerCase()
          )
        )
        .map((country: any) => ({
          name: country.country,
          code: country.iso2 || country.iso3 || country.country.substring(0, 2).toUpperCase(),
        }));

      return africanCountries.length > 0 ? africanCountries : staticCountries;
    } catch (error) {
      console.error("Error fetching African countries:", error);
      return this.getStaticAfricanCountries();
    }
  },

  async getCitiesByCountry(countryName: string): Promise<City[]> {
    try {
      const res = await fetch(`${BASE_URL}/countries/cities`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ country: countryName }),
      });

      const json = await res.json();

      if (!json?.data) return [];

      return json.data.map((city: string) => ({
        name: city,
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  },

  async searchCities(countryName: string, query: string): Promise<City[]> {
    if (!query.trim()) {
      return this.getCitiesByCountry(countryName);
    }

    const cities = await this.getCitiesByCountry(countryName);

    return cities.filter((city) =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Static fallback list of African countries
  getStaticAfricanCountries(): Country[] {
    return [
      { name: "Algeria", code: "DZ" },
      { name: "Angola", code: "AO" },
      { name: "Benin", code: "BJ" },
      { name: "Botswana", code: "BW" },
      { name: "Burkina Faso", code: "BF" },
      { name: "Burundi", code: "BI" },
      { name: "Cameroon", code: "CM" },
      { name: "Cape Verde", code: "CV" },
      { name: "Central African Republic", code: "CF" },
      { name: "Chad", code: "TD" },
      { name: "Comoros", code: "KM" },
      { name: "Democratic Republic of the Congo", code: "CD" },
      { name: "Djibouti", code: "DJ" },
      { name: "Egypt", code: "EG" },
      { name: "Equatorial Guinea", code: "GQ" },
      { name: "Eritrea", code: "ER" },
      { name: "Eswatini", code: "SZ" },
      { name: "Ethiopia", code: "ET" },
      { name: "Gabon", code: "GA" },
      { name: "Gambia", code: "GM" },
      { name: "Ghana", code: "GH" },
      { name: "Guinea", code: "GN" },
      { name: "Guinea-Bissau", code: "GW" },
      { name: "Ivory Coast", code: "CI" },
      { name: "Kenya", code: "KE" },
      { name: "Lesotho", code: "LS" },
      { name: "Liberia", code: "LR" },
      { name: "Libya", code: "LY" },
      { name: "Madagascar", code: "MG" },
      { name: "Malawi", code: "MW" },
      { name: "Mali", code: "ML" },
      { name: "Mauritania", code: "MR" },
      { name: "Mauritius", code: "MU" },
      { name: "Morocco", code: "MA" },
      { name: "Mozambique", code: "MZ" },
      { name: "Namibia", code: "NA" },
      { name: "Niger", code: "NE" },
      { name: "Nigeria", code: "NG" },
      { name: "Republic of the Congo", code: "CG" },
      { name: "Rwanda", code: "RW" },
      { name: "São Tomé and Príncipe", code: "ST" },
      { name: "Senegal", code: "SN" },
      { name: "Seychelles", code: "SC" },
      { name: "Sierra Leone", code: "SL" },
      { name: "Somalia", code: "SO" },
      { name: "South Africa", code: "ZA" },
      { name: "South Sudan", code: "SS" },
      { name: "Sudan", code: "SD" },
      { name: "Tanzania", code: "TZ" },
      { name: "Togo", code: "TG" },
      { name: "Tunisia", code: "TN" },
      { name: "Uganda", code: "UG" },
      { name: "Zambia", code: "ZM" },
      { name: "Zimbabwe", code: "ZW" },
    ];
  }
};