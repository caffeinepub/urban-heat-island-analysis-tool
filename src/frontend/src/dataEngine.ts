import { eachDayOfInterval, format } from "date-fns";

export interface WeatherDataPoint {
  date: string;
  dateObj: Date;
  temp: number;
  humidity: number;
  heatIndex: number;
  uhiEffect: number;
}

export interface CityConfig {
  baseTemp: number;
  seasonalAmplitude: number;
  hemisphere: "north" | "south";
}

const CITY_CONFIGS: Record<string, CityConfig> = {
  "New York": { baseTemp: 13, seasonalAmplitude: 15, hemisphere: "north" },
  London: { baseTemp: 12, seasonalAmplitude: 10, hemisphere: "north" },
  Tokyo: { baseTemp: 15, seasonalAmplitude: 14, hemisphere: "north" },
  Dubai: { baseTemp: 35, seasonalAmplitude: 8, hemisphere: "north" },
  Sydney: { baseTemp: 18, seasonalAmplitude: 10, hemisphere: "south" },
  Mumbai: { baseTemp: 28, seasonalAmplitude: 5, hemisphere: "north" },
  Paris: { baseTemp: 12, seasonalAmplitude: 11, hemisphere: "north" },
  Beijing: { baseTemp: 13, seasonalAmplitude: 18, hemisphere: "north" },
  Cairo: { baseTemp: 25, seasonalAmplitude: 10, hemisphere: "north" },
  "São Paulo": { baseTemp: 22, seasonalAmplitude: 6, hemisphere: "south" },
  "Mexico City": { baseTemp: 17, seasonalAmplitude: 5, hemisphere: "north" },
  Toronto: { baseTemp: 9, seasonalAmplitude: 17, hemisphere: "north" },
  Berlin: { baseTemp: 10, seasonalAmplitude: 13, hemisphere: "north" },
  Moscow: { baseTemp: 5, seasonalAmplitude: 22, hemisphere: "north" },
  Singapore: { baseTemp: 28, seasonalAmplitude: 2, hemisphere: "north" },
  Bangkok: { baseTemp: 29, seasonalAmplitude: 4, hemisphere: "north" },
  Lagos: { baseTemp: 28, seasonalAmplitude: 3, hemisphere: "north" },
  Nairobi: { baseTemp: 19, seasonalAmplitude: 3, hemisphere: "south" },
  "Buenos Aires": { baseTemp: 17, seasonalAmplitude: 9, hemisphere: "south" },
  Istanbul: { baseTemp: 14, seasonalAmplitude: 13, hemisphere: "north" },
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function cityHash(city: string): number {
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = ((hash << 5) - hash + city.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function getCityConfig(city: string): CityConfig {
  return (
    CITY_CONFIGS[city] || {
      baseTemp: 18 + (cityHash(city) % 20),
      seasonalAmplitude: 8 + (cityHash(city) % 10),
      hemisphere: "north" as const,
    }
  );
}

function computeHeatIndex(tempC: number, humidity: number): number {
  if (tempC < 27) return tempC;
  const T = tempC;
  const R = humidity;
  const hi =
    -8.78469475556 +
    1.61139411 * T +
    2.33854883889 * R +
    -0.14611605 * T * R +
    -0.012308094 * T * T +
    -0.0164248277778 * R * R +
    0.002211732 * T * T * R +
    0.00072546 * T * R * R +
    -0.000003582 * T * T * R * R;
  return Math.round(hi * 10) / 10;
}

export function generateWeatherData(
  city: string,
  startDate: Date,
  endDate: Date,
): WeatherDataPoint[] {
  const config = getCityConfig(city);
  const rand = seededRandom(cityHash(city));
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => {
    const dayOfYear = Math.floor(
      (day.getTime() - new Date(day.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    const phaseOffset = config.hemisphere === "south" ? Math.PI : 0;
    const seasonal =
      config.seasonalAmplitude *
      Math.sin((2 * Math.PI * dayOfYear) / 365 - Math.PI / 2 + phaseOffset);
    const noise = (rand() - 0.5) * 6;
    const temp = Math.round((config.baseTemp + seasonal + noise) * 10) / 10;
    const humidity = Math.round(40 + rand() * 50);
    const uhiEffect = Math.round((1.5 + rand() * 4) * 10) / 10;
    const heatIndex = computeHeatIndex(temp, humidity);

    return {
      date: format(day, "MMM d"),
      dateObj: day,
      temp,
      humidity,
      heatIndex,
      uhiEffect,
    };
  });
}

export function getHeatIntensityDistribution(data: WeatherDataPoint[]): {
  low: number;
  medium: number;
  high: number;
} {
  let low = 0;
  let medium = 0;
  let high = 0;
  for (const d of data) {
    if (d.temp < 25) low++;
    else if (d.temp < 35) medium++;
    else high++;
  }
  const total = data.length || 1;
  return {
    low: Math.round((low / total) * 100),
    medium: Math.round((medium / total) * 100),
    high: Math.round((high / total) * 100),
  };
}

export function toFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function convertTemp(c: number, unit: "C" | "F"): number {
  return unit === "F" ? toFahrenheit(c) : c;
}
