import { ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface City {
  name: string;
  country: string;
  flag?: string;
}

const FALLBACK_CITIES: City[] = [
  { name: "New York", country: "US", flag: "🇺🇸" },
  { name: "London", country: "GB", flag: "🇬🇧" },
  { name: "Tokyo", country: "JP", flag: "🇯🇵" },
  { name: "Dubai", country: "AE", flag: "🇦🇪" },
  { name: "Sydney", country: "AU", flag: "🇦🇺" },
  { name: "Mumbai", country: "IN", flag: "🇮🇳" },
  { name: "Paris", country: "FR", flag: "🇫🇷" },
  { name: "Beijing", country: "CN", flag: "🇨🇳" },
  { name: "Cairo", country: "EG", flag: "🇪🇬" },
  { name: "São Paulo", country: "BR", flag: "🇧🇷" },
  { name: "Mexico City", country: "MX", flag: "🇲🇽" },
  { name: "Toronto", country: "CA", flag: "🇨🇦" },
  { name: "Berlin", country: "DE", flag: "🇩🇪" },
  { name: "Moscow", country: "RU", flag: "🇷🇺" },
  { name: "Singapore", country: "SG", flag: "🇸🇬" },
  { name: "Bangkok", country: "TH", flag: "🇹🇭" },
  { name: "Lagos", country: "NG", flag: "🇳🇬" },
  { name: "Nairobi", country: "KE", flag: "🇰🇪" },
  { name: "Buenos Aires", country: "AR", flag: "🇦🇷" },
  { name: "Istanbul", country: "TR", flag: "🇹🇷" },
  { name: "Jakarta", country: "ID", flag: "🇮🇩" },
  { name: "Seoul", country: "KR", flag: "🇰🇷" },
  { name: "Karachi", country: "PK", flag: "🇵🇰" },
  { name: "Los Angeles", country: "US", flag: "🇺🇸" },
  { name: "Chicago", country: "US", flag: "🇺🇸" },
  { name: "Houston", country: "US", flag: "🇺🇸" },
  { name: "Phoenix", country: "US", flag: "🇺🇸" },
  { name: "Milan", country: "IT", flag: "🇮🇹" },
  { name: "Madrid", country: "ES", flag: "🇪🇸" },
  { name: "Barcelona", country: "ES", flag: "🇪🇸" },
  { name: "Amsterdam", country: "NL", flag: "🇳🇱" },
  { name: "Vienna", country: "AT", flag: "🇦🇹" },
  { name: "Zurich", country: "CH", flag: "🇨🇭" },
  { name: "Stockholm", country: "SE", flag: "🇸🇪" },
  { name: "Oslo", country: "NO", flag: "🇳🇴" },
  { name: "Copenhagen", country: "DK", flag: "🇩🇰" },
  { name: "Warsaw", country: "PL", flag: "🇵🇱" },
  { name: "Prague", country: "CZ", flag: "🇨🇿" },
  { name: "Budapest", country: "HU", flag: "🇭🇺" },
  { name: "Riyadh", country: "SA", flag: "🇸🇦" },
  { name: "Doha", country: "QA", flag: "🇶🇦" },
  { name: "Kuala Lumpur", country: "MY", flag: "🇲🇾" },
  { name: "Ho Chi Minh City", country: "VN", flag: "🇻🇳" },
  { name: "Manila", country: "PH", flag: "🇵🇭" },
  { name: "Dhaka", country: "BD", flag: "🇧🇩" },
  { name: "Colombo", country: "LK", flag: "🇱🇰" },
  { name: "Accra", country: "GH", flag: "🇬🇭" },
  { name: "Casablanca", country: "MA", flag: "🇲🇦" },
  { name: "Cape Town", country: "ZA", flag: "🇿🇦" },
  { name: "Johannesburg", country: "ZA", flag: "🇿🇦" },
];

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  cities?: { name: string; country: string }[];
}

export function CitySelector({ value, onChange, cities }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const cityList: City[] =
    cities && cities.length > 0
      ? cities.map((c) => ({
          ...c,
          flag: FALLBACK_CITIES.find((f) => f.name === c.name)?.flag || "🌍",
        }))
      : FALLBACK_CITIES;

  const filtered = cityList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedCity = cityList.find((c) => c.name === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        data-ocid="city.select"
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
        style={{
          background: "rgba(34,211,238,0.06)",
          border: "1px solid rgba(34,211,238,0.2)",
          color: "#E6EEF9",
          minWidth: "180px",
        }}
        onClick={() => setOpen(!open)}
      >
        <MapPin size={14} style={{ color: "#22D3EE" }} />
        <span className="font-medium">
          {selectedCity ? (
            <>
              <span className="mr-1.5">{selectedCity.flag}</span>
              {selectedCity.name}
            </>
          ) : (
            "Select city"
          )}
        </span>
        <ChevronDown
          size={14}
          className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#9AA7B7" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-64 z-50 rounded-xl overflow-hidden"
          style={{
            background: "rgba(9,14,24,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(34,211,238,0.25)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(34,211,238,0.08)",
          }}
        >
          <div className="p-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(34,211,238,0.06)" }}
            >
              <Search size={14} style={{ color: "#9AA7B7" }} />
              <input
                data-ocid="city.search_input"
                className="bg-transparent text-sm outline-none flex-1 placeholder-[#9AA7B7]"
                style={{ color: "#E6EEF9" }}
                placeholder="Search cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto px-2 pb-2">
            {filtered.length === 0 ? (
              <div
                className="px-3 py-4 text-center text-sm"
                style={{ color: "#9AA7B7" }}
              >
                No cities found
              </div>
            ) : (
              filtered.map((city) => (
                <button
                  type="button"
                  key={`${city.name}-${city.country}`}
                  data-ocid="city.dropdown_menu"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left"
                  style={{
                    color: city.name === value ? "#22D3EE" : "#E6EEF9",
                    background:
                      city.name === value
                        ? "rgba(34,211,238,0.12)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (city.name !== value)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(34,211,238,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (city.name !== value)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                  }}
                  onClick={() => {
                    onChange(city.name);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="text-base">{city.flag}</span>
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-xs" style={{ color: "#9AA7B7" }}>
                      {city.country}
                    </div>
                  </div>
                  {city.name === value && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "#22D3EE" }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
