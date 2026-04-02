import {
  ChevronDown,
  MapPin,
  Minus,
  RotateCcw,
  Search,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type CityData, INDIAN_CITIES } from "./data/indianCities";

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = "select" | "loading" | "results" | "error";

interface AnalysisResult {
  city: CityData;
  currentTemp: number;
  pastTemp: number;
  delta: number;
  trend: "warming" | "cooling" | "stable";
  insight: string;
}

// ── AI Insight Generator ───────────────────────────────────────────────────────
function generateInsight(
  city: string,
  current: number,
  past: number,
): { insight: string; trend: "warming" | "cooling" | "stable" } {
  const delta = current - past;
  const abs = Math.abs(delta).toFixed(1);

  if (Math.abs(delta) < 0.2) {
    return {
      trend: "stable",
      insight: `Stable temperature detected in ${city}. No significant Urban Heat Island trend observed over the past year.`,
    };
  }
  if (delta > 0) {
    const severity = delta > 3 ? "severe" : delta > 1.5 ? "moderate" : "mild";
    const severityText =
      severity === "severe"
        ? "critically intensifying"
        : severity === "moderate"
          ? "noticeably intensifying"
          : "gradually developing";
    return {
      trend: "warming",
      insight: `⚠️ ${city} has warmed by ${abs}°C over the past year, suggesting a ${severityText} Urban Heat Island effect. Urban surfaces are retaining more heat, likely due to increased impervious cover, reduced vegetation, and anthropogenic heat emissions.`,
    };
  }
  return {
    trend: "cooling",
    insight: `✅ ${city} has cooled by ${abs}°C over the past year, indicating reduced UHI pressure. This may reflect successful urban greening initiatives, reduced industrial activity, or favorable climatic shifts.`,
  };
}

// ── UHI Severity Bar ───────────────────────────────────────────────────────────
function UHISeverityBar({ delta }: { delta: number }) {
  const abs = Math.abs(delta);
  const position = Math.min((abs / 4) * 100, 100);

  let severityLabel = "Low";
  let severityColor = "#10B981";
  if (abs >= 3) {
    severityLabel = "Severe";
    severityColor = "#EF4444";
  } else if (abs >= 1.5) {
    severityLabel = "High";
    severityColor = "#F97316";
  } else if (abs >= 0.5) {
    severityLabel = "Moderate";
    severityColor = "#F59E0B";
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#9AA7B7" }}
        >
          UHI Severity
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `${severityColor}20`,
            color: severityColor,
            border: `1px solid ${severityColor}40`,
          }}
        >
          {severityLabel}
        </span>
      </div>
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{
          background: "rgba(13,20,35,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #10B981 0%, #F59E0B 40%, #F97316 70%, #EF4444 100%)",
            opacity: 0.85,
          }}
        />
        <motion.div
          initial={{ left: "0%" }}
          animate={{ left: `${Math.max(position - 1.5, 0)}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="absolute top-0 bottom-0 w-3 rounded-full"
          style={{
            background: "#fff",
            boxShadow: `0 0 8px ${severityColor}, 0 0 16px ${severityColor}80`,
            border: `2px solid ${severityColor}`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "#10B981" }}>
          Low
        </span>
        <span className="text-xs" style={{ color: "#F59E0B" }}>
          Moderate
        </span>
        <span className="text-xs" style={{ color: "#F97316" }}>
          High
        </span>
        <span className="text-xs" style={{ color: "#EF4444" }}>
          Severe
        </span>
      </div>
    </div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p style={{ color: "#9AA7B7", fontSize: 12, marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ color: "#22D3EE", fontWeight: 700, fontSize: 16 }}>
          {payload[0].value}°C
        </p>
      </div>
    );
  }
  return null;
}

// ── City Dropdown ──────────────────────────────────────────────────────────────
function CityDropdown({
  onSelect,
  stateFilter,
}: {
  onSelect: (city: CityData) => void;
  stateFilter: string | null;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CityData | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stateFilter) {
      setQuery(stateFilter);
      setOpen(true);
      inputRef.current?.focus();
    }
  }, [stateFilter]);

  const filtered =
    query.length < 1
      ? INDIAN_CITIES
      : INDIAN_CITIES.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.state.toLowerCase().includes(query.toLowerCase()),
        );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(city: CityData) {
    setSelected(city);
    setQuery(city.name);
    setOpen(false);
    onSelect(city);
  }

  return (
    <div ref={dropdownRef} className="relative" data-ocid="city.select">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "rgba(13,20,35,0.7)",
          border: "1px solid rgba(34,211,238,0.25)",
          boxShadow: open ? "0 0 16px rgba(34,211,238,0.15)" : "none",
          transition: "all 0.2s ease",
        }}
      >
        <Search size={16} style={{ color: "#22D3EE", flexShrink: 0 }} />
        <input
          ref={inputRef}
          id="city-search"
          className="flex-1 bg-transparent outline-none text-sm cursor-text"
          style={{ color: "#E6EEF9" }}
          placeholder="Search city or state..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          data-ocid="city.search_input"
        />
        <ChevronDown
          size={16}
          style={{
            color: "#9AA7B7",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              zIndex: 50,
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              maxHeight: 280,
              overflowY: "auto",
              background: "rgba(10,16,28,0.97)",
              border: "1px solid rgba(34,211,238,0.25)",
              borderRadius: 12,
              boxShadow:
                "0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(34,211,238,0.08)",
              transformOrigin: "top",
            }}
          >
            {filtered.length === 0 ? (
              <div
                className="px-4 py-6 text-center"
                style={{ color: "#9AA7B7", fontSize: 13 }}
              >
                No cities found
              </div>
            ) : (
              filtered.slice(0, 80).map((city) => {
                const key = `${city.name}-${city.state}`;
                const isHovered = hoveredKey === key;
                const isSelected =
                  selected?.name === city.name &&
                  selected?.state === city.state;
                return (
                  <button
                    key={key}
                    type="button"
                    className="w-full text-left px-4 py-2.5 flex items-center justify-between"
                    style={{
                      background: isHovered
                        ? "rgba(34,211,238,0.08)"
                        : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => handleSelect(city)}
                  >
                    <span
                      style={{
                        color: isSelected ? "#22D3EE" : "#E6EEF9",
                        fontSize: 14,
                      }}
                    >
                      {city.name}
                    </span>
                    <span
                      style={{ color: "#9AA7B7", fontSize: 11, marginLeft: 8 }}
                    >
                      {city.state}
                    </span>
                  </button>
                );
              })
            )}
            {filtered.length > 80 && (
              <div
                className="px-4 py-2 text-center"
                style={{
                  color: "#9AA7B7",
                  fontSize: 11,
                  borderTop: "1px solid rgba(34,211,238,0.1)",
                }}
              >
                Showing 80 of {filtered.length} — type more to narrow results
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState<Step>("select");
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  async function fetchTemperatures(city: CityData) {
    setStep("loading");
    setFetchError("");
    try {
      // Fetch current temp + coords from OpenWeatherMap
      const owmRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.name)},IN&units=metric&appid=9acbae70d97e4442cdcc7f48163234d6`,
      );
      if (!owmRes.ok) throw new Error("OpenWeatherMap fetch failed");
      const owmData = await owmRes.json();
      const currentTemp: number = owmData.main.temp;
      const lat: number = owmData.coord.lat;
      const lon: number = owmData.coord.lon;

      // Calculate date 1 year ago
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      const oneYearAgo = d.toISOString().split("T")[0];

      // Fetch historical temp from Open-Meteo
      const meteoRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${oneYearAgo}&end_date=${oneYearAgo}&daily=temperature_2m_mean&timezone=auto`,
      );
      if (!meteoRes.ok) throw new Error("Open-Meteo fetch failed");
      const meteoData = await meteoRes.json();
      const pastTemp: number = meteoData.daily.temperature_2m_mean[0];

      const delta = currentTemp - pastTemp;
      const { trend, insight } = generateInsight(
        city.name,
        currentTemp,
        pastTemp,
      );
      setResult({ city, currentTemp, pastTemp, delta, trend, insight });
      setStep("results");
    } catch (_err) {
      setFetchError(
        `Could not fetch temperature data for ${city.name}. Please try again.`,
      );
      setStep("error");
    }
  }

  function handleCitySelect(city: CityData) {
    setSelectedCity(city);
    fetchTemperatures(city);
  }

  function handleStateBadgeClick(state: string) {
    setStateFilter((prev) => (prev === state ? null : state));
  }

  function handleReset() {
    setStep("select");
    setSelectedCity(null);
    setResult(null);
    setFetchError("");
    setStateFilter(null);
  }

  const chartData = result
    ? [
        { label: "1 Year Ago", temp: result.pastTemp },
        { label: "Current", temp: result.currentTemp },
      ]
    : [];

  const trendColor =
    result?.trend === "warming"
      ? "#F97316"
      : result?.trend === "cooling"
        ? "#10B981"
        : "#22D3EE";

  const STATE_BADGES = [
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Delhi",
    "West Bengal",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #070A10 0%, #0B1220 50%, #080D18 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(7,10,16,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(34,211,238,0.12)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(34,211,238,0.15)",
              border: "1px solid rgba(34,211,238,0.3)",
            }}
          >
            <Thermometer size={16} style={{ color: "#22D3EE" }} />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest neon-text-cyan">
              Urban Heat Island Analysis Tool
            </h1>
            <p className="text-xs" style={{ color: "#9AA7B7" }}>
              UHI Analysis · India
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.25)",
              color: "#22D3EE",
            }}
          >
            {INDIAN_CITIES.length}+ Cities
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: City Selection */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.25)",
                    boxShadow: "0 0 30px rgba(34,211,238,0.15)",
                  }}
                >
                  <MapPin size={28} style={{ color: "#22D3EE" }} />
                </motion.div>
                <h2
                  className="text-3xl font-bold mb-3"
                  style={{ color: "#E6EEF9", letterSpacing: "-0.02em" }}
                >
                  Select Your City
                </h2>
                <p style={{ color: "#9AA7B7", fontSize: 15 }}>
                  Choose any city across India to begin UHI analysis
                </p>
              </div>

              <div className="glass-card p-6">
                <label
                  htmlFor="city-search"
                  className="block text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#9AA7B7" }}
                >
                  City · State
                </label>
                <CityDropdown
                  onSelect={handleCitySelect}
                  stateFilter={stateFilter}
                />
                <p className="mt-3 text-xs" style={{ color: "#9AA7B7" }}>
                  Covers all 28 states and 8 union territories ·{" "}
                  {INDIAN_CITIES.length} cities
                </p>
              </div>

              <div className="mt-4 mb-2">
                <p className="text-xs mb-2" style={{ color: "#9AA7B7" }}>
                  Quick filter by state:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATE_BADGES.map((s) => {
                  const isActive = stateFilter === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className="state-badge px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: isActive
                          ? "rgba(34,211,238,0.2)"
                          : "rgba(34,211,238,0.07)",
                        border: isActive
                          ? "1px solid rgba(34,211,238,0.5)"
                          : "1px solid rgba(34,211,238,0.15)",
                        color: isActive ? "#22D3EE" : "#9AA7B7",
                        boxShadow: isActive
                          ? "0 0 10px rgba(34,211,238,0.2)"
                          : "none",
                      }}
                      onClick={() => handleStateBadgeClick(s)}
                      data-ocid="city.tab"
                    >
                      {s}
                    </button>
                  );
                })}
                <span
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "rgba(34,211,238,0.07)",
                    border: "1px solid rgba(34,211,238,0.15)",
                    color: "#9AA7B7",
                  }}
                >
                  + more via search
                </span>
              </div>
            </motion.div>
          )}

          {/* LOADING */}
          {step === "loading" && selectedCity && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              data-ocid="fetch.loading_state"
            >
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.25)",
                  }}
                >
                  <MapPin size={14} style={{ color: "#22D3EE" }} />
                  <span
                    style={{ color: "#22D3EE", fontWeight: 600, fontSize: 14 }}
                  >
                    {selectedCity.name}
                  </span>
                  <span style={{ color: "#9AA7B7", fontSize: 12 }}>
                    · {selectedCity.state}
                  </span>
                </div>
              </div>

              <div
                className="glass-card p-10 flex flex-col items-center gap-6"
                style={{
                  background: "rgba(13,20,35,0.7)",
                  border: "1px solid rgba(34,211,238,0.25)",
                }}
              >
                {/* Spinner */}
                <div className="relative w-16 h-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.1,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "3px solid rgba(34,211,238,0.12)",
                      borderTopColor: "#22D3EE",
                    }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.7,
                      ease: "linear",
                    }}
                    className="absolute inset-2 rounded-full"
                    style={{
                      border: "2px solid rgba(139,92,246,0.12)",
                      borderBottomColor: "#8B5CF6",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Thermometer size={18} style={{ color: "#22D3EE" }} />
                  </div>
                </div>

                <div className="text-center">
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                    }}
                    className="text-base font-medium"
                    style={{ color: "#E6EEF9" }}
                  >
                    Fetching live temperature data for{" "}
                    <span style={{ color: "#22D3EE" }}>
                      {selectedCity.name}
                    </span>
                    ...
                  </motion.p>
                  <p className="text-xs mt-2" style={{ color: "#9AA7B7" }}>
                    Connecting to OpenWeatherMap &amp; Open-Meteo
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {step === "error" && selectedCity && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              data-ocid="fetch.error_state"
            >
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.3)",
                  }}
                >
                  <MapPin size={14} style={{ color: "#F97316" }} />
                  <span
                    style={{ color: "#F97316", fontWeight: 600, fontSize: 14 }}
                  >
                    {selectedCity.name}
                  </span>
                  <span style={{ color: "#9AA7B7", fontSize: 12 }}>
                    · {selectedCity.state}
                  </span>
                </div>
              </div>

              <div
                className="glass-card p-8 flex flex-col items-center gap-6"
                style={{
                  background: "rgba(20,10,10,0.7)",
                  border: "1px solid rgba(249,115,22,0.3)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.35)",
                  }}
                >
                  <span style={{ fontSize: 26 }}>⚠️</span>
                </div>

                <div className="text-center">
                  <p
                    className="text-base font-medium"
                    style={{ color: "#F97316" }}
                  >
                    {fetchError}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "#9AA7B7" }}>
                    This may be a temporary network issue. Please try again.
                  </p>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(13,20,35,0.7)",
                      border: "1px solid rgba(34,211,238,0.15)",
                      color: "#9AA7B7",
                      transition: "all 0.2s",
                    }}
                    onClick={handleReset}
                    data-ocid="fetch.cancel_button"
                  >
                    <RotateCcw size={14} />
                    Back
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-xl text-sm font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.1) 100%)",
                      border: "1px solid rgba(249,115,22,0.4)",
                      color: "#F97316",
                      boxShadow: "0 0 20px rgba(249,115,22,0.15)",
                      transition: "all 0.2s",
                    }}
                    onClick={() => fetchTemperatures(selectedCity)}
                    data-ocid="fetch.primary_button"
                  >
                    Try Again →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {step === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                  style={{
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.25)",
                  }}
                >
                  <MapPin size={14} style={{ color: "#22D3EE" }} />
                  <span
                    style={{ color: "#22D3EE", fontWeight: 600, fontSize: 14 }}
                  >
                    {result.city.name}
                  </span>
                  <span style={{ color: "#9AA7B7", fontSize: 12 }}>
                    · {result.city.state}
                  </span>
                </div>
                <h2
                  className="text-3xl font-bold"
                  style={{ color: "#E6EEF9", letterSpacing: "-0.02em" }}
                >
                  UHI Analysis Results
                </h2>
              </div>

              {/* Delta Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
                style={{ borderColor: `${trendColor}40`, cursor: "default" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "#9AA7B7" }}
                    >
                      Temperature Change
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-5xl font-black font-mono"
                        style={{ color: trendColor, lineHeight: 1 }}
                      >
                        {result.delta >= 0 ? "+" : ""}
                        {result.delta.toFixed(1)}°C
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#9AA7B7" }}>
                      vs 1 year ago · {result.pastTemp.toFixed(1)}°C →{" "}
                      {result.currentTemp.toFixed(1)}°C
                    </p>
                  </div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `${trendColor}18`,
                      border: `1px solid ${trendColor}40`,
                      boxShadow: `0 0 20px ${trendColor}20`,
                    }}
                  >
                    {result.trend === "warming" ? (
                      <TrendingUp size={24} style={{ color: trendColor }} />
                    ) : result.trend === "cooling" ? (
                      <TrendingDown size={24} style={{ color: trendColor }} />
                    ) : (
                      <Minus size={24} style={{ color: trendColor }} />
                    )}
                  </div>
                </div>
                <UHISeverityBar delta={result.delta} />
              </motion.div>

              {/* Chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
                style={{ cursor: "default" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "#9AA7B7" }}
                >
                  Temperature Comparison
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barSize={56}>
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(34,211,238,0.06)"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9AA7B7", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9AA7B7", fontSize: 11 }}
                      tickFormatter={(v) => `${v}°`}
                      domain={[
                        Math.min(result.pastTemp, result.currentTemp) - 4,
                        Math.max(result.pastTemp, result.currentTemp) + 4,
                      ]}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(34,211,238,0.04)" }}
                    />
                    <ReferenceLine
                      y={result.pastTemp}
                      stroke="rgba(139,92,246,0.4)"
                      strokeDasharray="4 4"
                    />
                    <Bar dataKey="temp" radius={[8, 8, 0, 0]}>
                      <Cell fill="rgba(139,92,246,0.7)" />
                      <Cell fill={`${trendColor}CC`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: "rgba(139,92,246,0.7)" }}
                    />
                    <span className="text-xs" style={{ color: "#9AA7B7" }}>
                      1 Year Ago ({result.pastTemp.toFixed(1)}°C)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: `${trendColor}CC` }}
                    />
                    <span className="text-xs" style={{ color: "#9AA7B7" }}>
                      Current ({result.currentTemp.toFixed(1)}°C)
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* AI Insight */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
                style={{ borderColor: `${trendColor}30`, cursor: "default" }}
                data-ocid="results.panel"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{
                      background: `${trendColor}20`,
                      border: `1px solid ${trendColor}40`,
                    }}
                  >
                    <span style={{ fontSize: 13 }}>🤖</span>
                  </div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#9AA7B7" }}
                  >
                    AI Insight
                  </p>
                </div>
                <p style={{ color: "#E6EEF9", fontSize: 15, lineHeight: 1.65 }}>
                  {result.insight}
                </p>
              </motion.div>

              {/* Reset */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="button"
                  className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 pulse-glow-btn"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.08) 100%)",
                    border: "1px solid rgba(34,211,238,0.35)",
                    color: "#22D3EE",
                    letterSpacing: "0.03em",
                    transition: "all 0.2s",
                  }}
                  onClick={handleReset}
                  data-ocid="results.primary_button"
                >
                  <RotateCcw size={15} />
                  Analyze Another City
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-8 px-4"
        style={{ borderTop: "1px solid rgba(34,211,238,0.08)" }}
      >
        <p className="text-xs" style={{ color: "#4B5563" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#22D3EE" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
