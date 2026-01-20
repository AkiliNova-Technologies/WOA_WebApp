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
    const res = await fetch(`${BASE_URL}/countries/continent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ continent: "Africa" }),
    });

    const json = await res.json();

    if (!json?.data) return [];

    return json.data.map((c: any) => ({
      name: c.name,
      code: c.iso2,
    }));
  },

  async getCitiesByCountry(countryName: string): Promise<City[]> {
    const res = await fetch(`${BASE_URL}/countries/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName }),
    });

    const json = await res.json();

    if (!json?.data) return [];

    return json.data.map((city: string) => ({
      name: city,
    }));
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
};
