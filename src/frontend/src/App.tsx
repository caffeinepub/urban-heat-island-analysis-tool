import {
  ArrowLeftRight,
  ChevronDown,
  Flame,
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
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type CityData, INDIAN_CITIES } from "./data/indianCities";

// ── Types ──────────────────────────────────────────────────────────────────────
type Step = "select" | "loading" | "results" | "error";
type CompareStep = "select" | "loading" | "results" | "error";

interface AnalysisResult {
  city: CityData;
  currentTemp: number;
  pastTemp: number;
  delta: number;
  trend: "warming" | "cooling" | "stable";
  insight: string;
}

interface DeltaTheme {
  bg: string;
  accent: string;
  headerBg: string;
}

// ── Delta Theme ────────────────────────────────────────────────────────────────
function getDeltaTheme(delta: number | null): DeltaTheme {
  if (delta === null) {
    return {
      bg: "linear-gradient(135deg, #0e0808 0%, #150d0d 50%, #1a0e08 100%)",
      accent: "#fb923c",
      headerBg: "rgba(14,8,8,0.85)",
    };
  }
  if (delta <= 0) {
    return {
      bg: "linear-gradient(135deg, #020B18 0%, #031220 50%, #041828 100%)",
      accent: "#38BDF8",
      headerBg: "rgba(2,11,24,0.85)",
    };
  }
  if (delta < 0.5) {
    return {
      bg: "linear-gradient(135deg, #031418 0%, #041C22 50%, #052028 100%)",
      accent: "#22D3EE",
      headerBg: "rgba(3,20,24,0.85)",
    };
  }
  if (delta < 1.5) {
    return {
      bg: "linear-gradient(135deg, #041A10 0%, #062015 50%, #07251A 100%)",
      accent: "#34D399",
      headerBg: "rgba(4,26,16,0.85)",
    };
  }
  if (delta < 3) {
    return {
      bg: "linear-gradient(135deg, #0e0808 0%, #150d0d 50%, #1a0e08 100%)",
      accent: "#fb923c",
      headerBg: "rgba(14,8,8,0.85)",
    };
  }
  return {
    bg: "linear-gradient(135deg, #180402 0%, #220402 50%, #260302 100%)",
    accent: "#EF4444",
    headerBg: "rgba(24,4,2,0.85)",
  };
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

// ── Comparative AI Feedback ────────────────────────────────────────────────────
function generateComparisonFeedback(
  cityA: string,
  tempA: number,
  pastA: number,
  cityB: string,
  tempB: number,
  pastB: number,
): string {
  const diff = Math.abs(tempA - tempB).toFixed(1);
  const hotter = tempA > tempB ? cityA : cityB;
  const cooler = tempA > tempB ? cityB : cityA;
  const deltaA = (tempA - pastA).toFixed(1);
  const deltaB = (tempB - pastB).toFixed(1);
  const higherUHI = tempA - pastA > tempB - pastB ? cityA : cityB;
  return `${hotter} is currently ${diff}°C warmer than ${cooler}. ${cityA} shows a UHI delta of ${deltaA}°C while ${cityB} shows ${deltaB}°C — ${higherUHI} has the stronger Urban Heat Island effect. Urban planners should prioritize green infrastructure and heat mitigation strategies in ${higherUHI}.`;
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
          style={{ color: "#B7937A" }}
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
          background: "rgba(30,12,8,0.8)",
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
        <p style={{ color: "#B7937A", fontSize: 12, marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ color: "#fb923c", fontWeight: 700, fontSize: 16 }}>
          {payload[0].value}°C
        </p>
      </div>
    );
  }
  return null;
}

// ── Compare Custom Tooltip ─────────────────────────────────────────────────────
function CompareTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(14,8,8,0.96)",
          border: "1px solid rgba(251,146,60,0.25)",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <p
          style={{
            color: "#B7937A",
            fontSize: 11,
            marginBottom: 6,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </p>
        {payload.map((entry: any) => (
          <p
            key={entry.name}
            style={{
              color: entry.color,
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.value.toFixed(1)
              : entry.value}
            °C
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ── City Dropdown ──────────────────────────────────────────────────────────────
function CityDropdown({
  onSelect,
  stateFilter,
  label,
  accentColor,
  excludeCity,
}: {
  onSelect: (city: CityData) => void;
  stateFilter: string | null;
  label?: string;
  accentColor?: string;
  excludeCity?: CityData | null;
}) {
  const accent = accentColor ?? "#fb923c";
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

  const filtered = (
    query.length < 1
      ? INDIAN_CITIES
      : INDIAN_CITIES.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.state.toLowerCase().includes(query.toLowerCase()),
        )
  ).filter(
    (c) =>
      !excludeCity ||
      !(c.name === excludeCity.name && c.state === excludeCity.state),
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
      {label && (
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: accent }}
        >
          {label}
        </p>
      )}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "rgba(30,12,8,0.7)",
          border: `1px solid ${accent}40`,
          boxShadow: open ? `0 0 16px ${accent}20` : "none",
          transition: "all 0.2s ease",
        }}
      >
        <Search size={16} style={{ color: accent, flexShrink: 0 }} />
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-sm cursor-text"
          style={{ color: "#F5E6D8" }}
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
            color: "#B7937A",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>

      {selected && (
        <div className="flex items-center gap-1.5 mt-2 px-1">
          <MapPin size={11} style={{ color: accent }} />
          <span className="text-xs font-medium" style={{ color: accent }}>
            {selected.name}
          </span>
          <span className="text-xs" style={{ color: "#B7937A" }}>
            · {selected.state}
          </span>
        </div>
      )}

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
              background: "rgba(14,8,8,0.97)",
              border: `1px solid ${accent}30`,
              borderRadius: 12,
              boxShadow:
                "0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(251,146,60,0.08)",
              transformOrigin: "top",
            }}
          >
            {filtered.length === 0 ? (
              <div
                className="px-4 py-6 text-center"
                style={{ color: "#B7937A", fontSize: 13 }}
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
                      background: isHovered ? `${accent}14` : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => handleSelect(city)}
                  >
                    <span
                      style={{
                        color: isSelected ? accent : "#F5E6D8",
                        fontSize: 14,
                      }}
                    >
                      {city.name}
                    </span>
                    <span
                      style={{ color: "#B7937A", fontSize: 11, marginLeft: 8 }}
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
                  color: "#B7937A",
                  fontSize: 11,
                  borderTop: `1px solid ${accent}14`,
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
  // Single city mode state
  const [step, setStep] = useState<Step>("select");
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  // Mode toggle
  const [compareMode, setCompareMode] = useState(false);

  // Compare mode state
  const [compareStep, setCompareStep] = useState<CompareStep>("select");
  const [cityA, setCityA] = useState<CityData | null>(null);
  const [cityB, setCityB] = useState<CityData | null>(null);
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);
  const [compareError, setCompareError] = useState("");

  const singleDelta = result?.delta ?? null;
  const compareDelta =
    resultA && resultB
      ? Math.abs(resultA.currentTemp - resultB.currentTemp)
      : null;

  const theme = getDeltaTheme(compareMode ? compareDelta : singleDelta);

  // ── Single-city fetch ────────────────────────────────────────────────────────
  async function fetchTemperatures(city: CityData) {
    setStep("loading");
    setFetchError("");
    try {
      const owmRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.name)},IN&units=metric&appid=9acbae70d97e4442cdcc7f48163234d6`,
      );
      if (!owmRes.ok) throw new Error("OpenWeatherMap fetch failed");
      const owmData = await owmRes.json();
      const currentTemp: number = owmData.main.temp;
      const lat: number = owmData.coord.lat;
      const lon: number = owmData.coord.lon;

      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      const oneYearAgo = d.toISOString().split("T")[0];

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

  // ── Compare fetch helper ─────────────────────────────────────────────────────
  async function fetchCityData(city: CityData): Promise<AnalysisResult> {
    const owmRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.name)},IN&units=metric&appid=9acbae70d97e4442cdcc7f48163234d6`,
    );
    if (!owmRes.ok)
      throw new Error(`OpenWeatherMap fetch failed for ${city.name}`);
    const owmData = await owmRes.json();
    const currentTemp: number = owmData.main.temp;
    const lat: number = owmData.coord.lat;
    const lon: number = owmData.coord.lon;

    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    const oneYearAgo = d.toISOString().split("T")[0];

    const meteoRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${oneYearAgo}&end_date=${oneYearAgo}&daily=temperature_2m_mean&timezone=auto`,
    );
    if (!meteoRes.ok)
      throw new Error(`Open-Meteo fetch failed for ${city.name}`);
    const meteoData = await meteoRes.json();
    const pastTemp: number = meteoData.daily.temperature_2m_mean[0];

    const delta = currentTemp - pastTemp;
    const { trend, insight } = generateInsight(
      city.name,
      currentTemp,
      pastTemp,
    );
    return { city, currentTemp, pastTemp, delta, trend, insight };
  }

  // ── Compare fetch (parallel) ─────────────────────────────────────────────────
  async function fetchBothCities(a: CityData, b: CityData) {
    setCompareStep("loading");
    setCompareError("");
    try {
      const [rA, rB] = await Promise.all([fetchCityData(a), fetchCityData(b)]);
      setResultA(rA);
      setResultB(rB);
      setCompareStep("results");
    } catch (_err) {
      setCompareError(
        "Could not fetch temperature data for one or both cities. Please try again.",
      );
      setCompareStep("error");
    }
  }

  function handleCitySelect(city: CityData) {
    setSelectedCity(city);
    fetchTemperatures(city);
  }

  function handleStateBadgeClick(s: string) {
    setStateFilter((prev) => (prev === s ? null : s));
  }

  function handleReset() {
    setStep("select");
    setSelectedCity(null);
    setResult(null);
    setFetchError("");
    setStateFilter(null);
  }

  function handleCompareReset() {
    setCompareStep("select");
    setCityA(null);
    setCityB(null);
    setResultA(null);
    setResultB(null);
    setCompareError("");
  }

  function handleSwitchMode(mode: boolean) {
    setCompareMode(mode);
    if (!mode) handleReset();
    else handleCompareReset();
  }

  // ── When both cities selected, auto-fetch ────────────────────────────────────
  function handleCityASelect(city: CityData) {
    setCityA(city);
    if (cityB) fetchBothCities(city, cityB);
  }

  function handleCityBSelect(city: CityData) {
    setCityB(city);
    if (cityA) fetchBothCities(cityA, city);
  }

  // ── Chart data ───────────────────────────────────────────────────────────────
  const singleChartData = result
    ? [
        { label: "1 Year Ago", temp: result.pastTemp },
        { label: "Current", temp: result.currentTemp },
      ]
    : [];

  const compareChartData =
    resultA && resultB
      ? [
          {
            label: "1 Year Ago",
            [resultA.city.name]: resultA.pastTemp,
            [resultB.city.name]: resultB.pastTemp,
          },
          {
            label: "Current",
            [resultA.city.name]: resultA.currentTemp,
            [resultB.city.name]: resultB.currentTemp,
          },
        ]
      : [];

  const trendColor =
    result?.trend === "warming"
      ? "#F97316"
      : result?.trend === "cooling"
        ? "#10B981"
        : "#fb923c";

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

  const CITY_A_COLOR = "#22D3EE";
  const CITY_B_COLOR = "#fb923c";

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme.bg,
        backgroundAttachment: "fixed",
        transition: "background 1.2s ease",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: theme.headerBg,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.accent}1e`,
          transition: "background 1.2s ease, border-color 1.2s ease",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `${theme.accent}26`,
              border: `1px solid ${theme.accent}4d`,
              transition:
                "background 1.2s ease, border-color 1.2s ease, box-shadow 1.2s ease",
              boxShadow: "none",
            }}
          >
            <Thermometer
              size={16}
              style={{ color: theme.accent, transition: "color 1.2s ease" }}
            />
          </div>
          <div>
            <h1
              className="text-sm font-bold uppercase tracking-widest"
              style={{
                color: theme.accent,
                textShadow: `0 0 10px ${theme.accent}99, 0 0 20px ${theme.accent}4d`,
                transition: "color 1.2s ease, text-shadow 1.2s ease",
              }}
            >
              Urban Heat Island Analysis Tool
            </h1>
            <p className="text-xs" style={{ color: "#B7937A" }}>
              UHI Analysis · India
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: `${theme.accent}1a`,
              border: `1px solid ${theme.accent}40`,
              color: theme.accent,
              transition: "all 1.2s ease",
            }}
          >
            {INDIAN_CITIES.length}+ Cities
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Mode Toggle (always visible on select step) */}
        {(step === "select" || compareStep === "select" || compareMode) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div
              className="flex p-1 rounded-2xl gap-1"
              style={{
                background: "rgba(20,10,6,0.8)",
                border: "1px solid rgba(251,146,60,0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300"
                style={{
                  background: !compareMode
                    ? "rgba(251,146,60,0.18)"
                    : "transparent",
                  color: !compareMode ? "#fb923c" : "#B7937A",
                  border: !compareMode
                    ? "1px solid rgba(251,146,60,0.4)"
                    : "1px solid transparent",
                  boxShadow: !compareMode
                    ? "0 0 16px rgba(251,146,60,0.2)"
                    : "none",
                }}
                onClick={() => handleSwitchMode(false)}
                data-ocid="mode.tab"
              >
                <Thermometer size={14} />
                Single City
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300"
                style={{
                  background: compareMode
                    ? "rgba(251,146,60,0.18)"
                    : "transparent",
                  color: compareMode ? "#fb923c" : "#B7937A",
                  border: compareMode
                    ? "1px solid rgba(251,146,60,0.4)"
                    : "1px solid transparent",
                  boxShadow: compareMode
                    ? "0 0 16px rgba(251,146,60,0.2)"
                    : "none",
                }}
                onClick={() => handleSwitchMode(true)}
                data-ocid="compare.tab"
              >
                <ArrowLeftRight size={14} />
                Compare Cities
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ════════════════════════════════════════════════
              SINGLE CITY MODE
          ════════════════════════════════════════════════ */}
          {!compareMode && (
            <motion.div key="single-mode">
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
                          background: "rgba(251,146,60,0.1)",
                          border: "1px solid rgba(251,146,60,0.25)",
                          boxShadow: "0 0 30px rgba(251,146,60,0.15)",
                        }}
                      >
                        <MapPin size={28} style={{ color: "#fb923c" }} />
                      </motion.div>
                      <h2
                        className="text-3xl font-bold mb-3"
                        style={{ color: "#F5E6D8", letterSpacing: "-0.02em" }}
                      >
                        Select Your City
                      </h2>
                      <p style={{ color: "#B7937A", fontSize: 15 }}>
                        Choose any city across India to begin UHI analysis
                      </p>
                    </div>

                    <div className="glass-card p-6">
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: "#B7937A" }}
                      >
                        City · State
                      </p>
                      <CityDropdown
                        onSelect={handleCitySelect}
                        stateFilter={stateFilter}
                      />
                      <p className="mt-3 text-xs" style={{ color: "#B7937A" }}>
                        Covers all 28 states and 8 union territories ·{" "}
                        {INDIAN_CITIES.length} cities
                      </p>
                    </div>

                    <div className="mt-4 mb-2">
                      <p className="text-xs mb-2" style={{ color: "#B7937A" }}>
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
                                ? "rgba(251,146,60,0.2)"
                                : "rgba(251,146,60,0.07)",
                              border: isActive
                                ? "1px solid rgba(251,146,60,0.5)"
                                : "1px solid rgba(251,146,60,0.15)",
                              color: isActive ? "#fb923c" : "#B7937A",
                              boxShadow: isActive
                                ? "0 0 10px rgba(251,146,60,0.2)"
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
                          background: "rgba(251,146,60,0.07)",
                          border: "1px solid rgba(251,146,60,0.15)",
                          color: "#B7937A",
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
                          background: "rgba(251,146,60,0.1)",
                          border: "1px solid rgba(251,146,60,0.25)",
                        }}
                      >
                        <MapPin size={14} style={{ color: "#fb923c" }} />
                        <span
                          style={{
                            color: "#fb923c",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {selectedCity.name}
                        </span>
                        <span style={{ color: "#B7937A", fontSize: 12 }}>
                          · {selectedCity.state}
                        </span>
                      </div>
                    </div>

                    <div
                      className="glass-card p-10 flex flex-col items-center gap-6"
                      style={{
                        background: "rgba(30,12,8,0.7)",
                        border: "1px solid rgba(251,146,60,0.25)",
                      }}
                    >
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
                            border: "3px solid rgba(251,146,60,0.12)",
                            borderTopColor: "#fb923c",
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
                            border: "2px solid rgba(244,114,182,0.12)",
                            borderBottomColor: "#f472b6",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Thermometer size={18} style={{ color: "#fb923c" }} />
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
                          style={{ color: "#F5E6D8" }}
                        >
                          Fetching live temperature data for{" "}
                          <span style={{ color: "#fb923c" }}>
                            {selectedCity.name}
                          </span>
                          ...
                        </motion.p>
                        <p
                          className="text-xs mt-2"
                          style={{ color: "#B7937A" }}
                        >
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
                          style={{
                            color: "#F97316",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {selectedCity.name}
                        </span>
                        <span style={{ color: "#B7937A", fontSize: 12 }}>
                          · {selectedCity.state}
                        </span>
                      </div>
                    </div>

                    <div
                      className="glass-card p-8 flex flex-col items-center gap-6"
                      style={{
                        background: "rgba(30,10,8,0.7)",
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
                        <p
                          className="text-xs mt-2"
                          style={{ color: "#B7937A" }}
                        >
                          This may be a temporary network issue. Please try
                          again.
                        </p>
                      </div>

                      <div className="flex gap-3 w-full">
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                          style={{
                            background: "rgba(30,12,8,0.7)",
                            border: "1px solid rgba(251,146,60,0.15)",
                            color: "#B7937A",
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
                          background: `${theme.accent}1a`,
                          border: `1px solid ${theme.accent}40`,
                        }}
                      >
                        <MapPin size={14} style={{ color: theme.accent }} />
                        <span
                          style={{
                            color: theme.accent,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {result.city.name}
                        </span>
                        <span style={{ color: "#B7937A", fontSize: 12 }}>
                          · {result.city.state}
                        </span>
                      </div>
                      <h2
                        className="text-3xl font-bold"
                        style={{ color: "#F5E6D8", letterSpacing: "-0.02em" }}
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
                      style={{
                        borderColor: `${trendColor}40`,
                        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${theme.accent}18`,
                        cursor: "default",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-widest mb-1"
                            style={{ color: "#B7937A" }}
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
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#B7937A" }}
                          >
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
                            <TrendingUp
                              size={24}
                              style={{ color: trendColor }}
                            />
                          ) : result.trend === "cooling" ? (
                            <TrendingDown
                              size={24}
                              style={{ color: trendColor }}
                            />
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
                        style={{ color: "#B7937A" }}
                      >
                        Temperature Comparison
                      </p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={singleChartData} barSize={56}>
                          <CartesianGrid
                            vertical={false}
                            stroke={`${theme.accent}0f`}
                          />
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#B7937A",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#B7937A", fontSize: 11 }}
                            tickFormatter={(v) => `${v}°`}
                            domain={[
                              Math.min(result.pastTemp, result.currentTemp) - 4,
                              Math.max(result.pastTemp, result.currentTemp) + 4,
                            ]}
                          />
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: `${theme.accent}0a` }}
                          />
                          <ReferenceLine
                            y={result.pastTemp}
                            stroke="rgba(244,114,182,0.4)"
                            strokeDasharray="4 4"
                          />
                          <Bar dataKey="temp" radius={[8, 8, 0, 0]}>
                            <Cell fill="rgba(244,114,182,0.7)" />
                            <Cell fill={`${theme.accent}CC`} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ background: "rgba(244,114,182,0.7)" }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "#B7937A" }}
                          >
                            1 Year Ago ({result.pastTemp.toFixed(1)}°C)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ background: `${theme.accent}CC` }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "#B7937A" }}
                          >
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
                      style={{
                        borderColor: `${trendColor}30`,
                        cursor: "default",
                      }}
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
                          style={{ color: "#B7937A" }}
                        >
                          AI Insight
                        </p>
                      </div>
                      <p
                        style={{
                          color: "#F5E6D8",
                          fontSize: 15,
                          lineHeight: 1.65,
                        }}
                      >
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
                          background: `linear-gradient(135deg, ${theme.accent}2e 0%, ${theme.accent}14 100%)`,
                          border: `1px solid ${theme.accent}59`,
                          color: theme.accent,
                          letterSpacing: "0.03em",
                          transition: "all 1.2s ease",
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
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════
              COMPARE CITIES MODE
          ════════════════════════════════════════════════ */}
          {compareMode && (
            <motion.div key="compare-mode">
              <AnimatePresence mode="wait">
                {/* COMPARE: Select */}
                {compareStep === "select" && (
                  <motion.div
                    key="compare-select"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                        style={{
                          background: "rgba(251,146,60,0.1)",
                          border: "1px solid rgba(251,146,60,0.25)",
                          boxShadow: "0 0 30px rgba(251,146,60,0.15)",
                        }}
                      >
                        <ArrowLeftRight
                          size={28}
                          style={{ color: "#fb923c" }}
                        />
                      </motion.div>
                      <h2
                        className="text-3xl font-bold mb-3"
                        style={{ color: "#F5E6D8", letterSpacing: "-0.02em" }}
                      >
                        Compare Two Cities
                      </h2>
                      <p style={{ color: "#B7937A", fontSize: 15 }}>
                        Select two Indian cities to compare their temperature
                        trends
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* City A */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card p-5"
                        style={{ borderColor: `${CITY_A_COLOR}30` }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                            style={{
                              background: `${CITY_A_COLOR}22`,
                              border: `1px solid ${CITY_A_COLOR}50`,
                              color: CITY_A_COLOR,
                            }}
                          >
                            A
                          </div>
                          <span
                            className="text-xs font-semibold uppercase tracking-widest"
                            style={{ color: CITY_A_COLOR }}
                          >
                            City A
                          </span>
                        </div>
                        <CityDropdown
                          onSelect={handleCityASelect}
                          stateFilter={null}
                          accentColor={CITY_A_COLOR}
                          excludeCity={cityB}
                        />
                      </motion.div>

                      {/* City B */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-5"
                        style={{ borderColor: `${CITY_B_COLOR}30` }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                            style={{
                              background: `${CITY_B_COLOR}22`,
                              border: `1px solid ${CITY_B_COLOR}50`,
                              color: CITY_B_COLOR,
                            }}
                          >
                            B
                          </div>
                          <span
                            className="text-xs font-semibold uppercase tracking-widest"
                            style={{ color: CITY_B_COLOR }}
                          >
                            City B
                          </span>
                        </div>
                        <CityDropdown
                          onSelect={handleCityBSelect}
                          stateFilter={null}
                          accentColor={CITY_B_COLOR}
                          excludeCity={cityA}
                        />
                      </motion.div>
                    </div>

                    {/* Hint */}
                    {(!cityA || !cityB) && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center text-sm mt-6"
                        style={{ color: "#B7937A" }}
                      >
                        {!cityA && !cityB
                          ? "Select both cities to start comparison"
                          : !cityA
                            ? "Now select City A"
                            : "Now select City B"}
                      </motion.p>
                    )}
                    {cityA && cityB && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm mt-6"
                        style={{ color: "#fb923c" }}
                      >
                        Both cities selected — fetching data...
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* COMPARE: Loading */}
                {compareStep === "loading" && cityA && cityB && (
                  <motion.div
                    key="compare-loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    data-ocid="compare.loading_state"
                  >
                    <div
                      className="glass-card p-12 flex flex-col items-center gap-6"
                      style={{
                        background: "rgba(30,12,8,0.7)",
                        border: "1px solid rgba(251,146,60,0.25)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1.1,
                              ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full"
                            style={{
                              border: `3px solid ${CITY_A_COLOR}22`,
                              borderTopColor: CITY_A_COLOR,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="text-xs font-black"
                              style={{ color: CITY_A_COLOR }}
                            >
                              A
                            </span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 1.5,
                          }}
                        >
                          <ArrowLeftRight
                            size={20}
                            style={{ color: "#B7937A" }}
                          />
                        </motion.div>
                        <div className="relative w-14 h-14">
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1.3,
                              ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full"
                            style={{
                              border: `3px solid ${CITY_B_COLOR}22`,
                              borderBottomColor: CITY_B_COLOR,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="text-xs font-black"
                              style={{ color: CITY_B_COLOR }}
                            >
                              B
                            </span>
                          </div>
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
                          style={{ color: "#F5E6D8" }}
                        >
                          Fetching data for{" "}
                          <span style={{ color: CITY_A_COLOR }}>
                            {cityA.name}
                          </span>{" "}
                          &amp;{" "}
                          <span style={{ color: CITY_B_COLOR }}>
                            {cityB.name}
                          </span>
                          ...
                        </motion.p>
                        <p
                          className="text-xs mt-2"
                          style={{ color: "#B7937A" }}
                        >
                          Running parallel requests to OpenWeatherMap &amp;
                          Open-Meteo
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* COMPARE: Error */}
                {compareStep === "error" && (
                  <motion.div
                    key="compare-error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    data-ocid="compare.error_state"
                  >
                    <div
                      className="glass-card p-8 flex flex-col items-center gap-6"
                      style={{
                        background: "rgba(30,10,8,0.7)",
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
                          {compareError}
                        </p>
                        <p
                          className="text-xs mt-2"
                          style={{ color: "#B7937A" }}
                        >
                          This may be a temporary network issue. Please try
                          again.
                        </p>
                      </div>
                      <div className="flex gap-3 w-full">
                        <button
                          type="button"
                          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                          style={{
                            background: "rgba(30,12,8,0.7)",
                            border: "1px solid rgba(251,146,60,0.15)",
                            color: "#B7937A",
                          }}
                          onClick={handleCompareReset}
                          data-ocid="compare.cancel_button"
                        >
                          <RotateCcw size={14} />
                          Back
                        </button>
                        {cityA && cityB && (
                          <button
                            type="button"
                            className="flex-1 py-3 rounded-xl text-sm font-bold"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.1) 100%)",
                              border: "1px solid rgba(249,115,22,0.4)",
                              color: "#F97316",
                              boxShadow: "0 0 20px rgba(249,115,22,0.15)",
                            }}
                            onClick={() => fetchBothCities(cityA, cityB)}
                            data-ocid="compare.primary_button"
                          >
                            Try Again →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* COMPARE: Results */}
                {compareStep === "results" && resultA && resultB && (
                  <motion.div
                    key="compare-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-5"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            background: `${CITY_A_COLOR}22`,
                            color: CITY_A_COLOR,
                            border: `1px solid ${CITY_A_COLOR}50`,
                          }}
                        >
                          {resultA.city.name}
                        </span>
                        <ArrowLeftRight
                          size={16}
                          style={{ color: "#B7937A" }}
                        />
                        <span
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            background: `${CITY_B_COLOR}22`,
                            color: CITY_B_COLOR,
                            border: `1px solid ${CITY_B_COLOR}50`,
                          }}
                        >
                          {resultB.city.name}
                        </span>
                      </div>
                      <h2
                        className="text-3xl font-bold"
                        style={{ color: "#F5E6D8", letterSpacing: "-0.02em" }}
                      >
                        Comparison Results
                      </h2>
                    </div>

                    {/* Temperature Difference Banner */}
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-5"
                      style={{
                        borderColor: "rgba(251,146,60,0.4)",
                        boxShadow: "0 0 24px rgba(251,146,60,0.12)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(251,146,60,0.15)",
                            border: "1px solid rgba(251,146,60,0.35)",
                          }}
                        >
                          <Flame size={18} style={{ color: "#fb923c" }} />
                        </div>
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                            style={{ color: "#B7937A" }}
                          >
                            Temperature Difference
                          </p>
                          <p
                            className="text-base font-bold"
                            style={{ color: "#F5E6D8" }}
                          >
                            {resultA.currentTemp > resultB.currentTemp ? (
                              <>
                                <span style={{ color: CITY_A_COLOR }}>
                                  {resultA.city.name}
                                </span>{" "}
                                is{" "}
                                <span style={{ color: "#fb923c" }}>
                                  {Math.abs(
                                    resultA.currentTemp - resultB.currentTemp,
                                  ).toFixed(1)}
                                  °C warmer
                                </span>{" "}
                                than{" "}
                                <span style={{ color: CITY_B_COLOR }}>
                                  {resultB.city.name}
                                </span>{" "}
                                right now
                              </>
                            ) : resultB.currentTemp > resultA.currentTemp ? (
                              <>
                                <span style={{ color: CITY_B_COLOR }}>
                                  {resultB.city.name}
                                </span>{" "}
                                is{" "}
                                <span style={{ color: "#fb923c" }}>
                                  {Math.abs(
                                    resultA.currentTemp - resultB.currentTemp,
                                  ).toFixed(1)}
                                  °C warmer
                                </span>{" "}
                                than{" "}
                                <span style={{ color: CITY_A_COLOR }}>
                                  {resultA.city.name}
                                </span>{" "}
                                right now
                              </>
                            ) : (
                              <>
                                <span style={{ color: "#34D399" }}>
                                  Both cities are at the same temperature
                                </span>{" "}
                                right now
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* City Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { r: resultA, color: CITY_A_COLOR, label: "A" },
                        { r: resultB, color: CITY_B_COLOR, label: "B" },
                      ].map(({ r, color, label }, idx) => {
                        const tc =
                          r.trend === "warming"
                            ? "#F97316"
                            : r.trend === "cooling"
                              ? "#10B981"
                              : "#fb923c";
                        return (
                          <motion.div
                            key={label}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15 + idx * 0.07 }}
                            className="glass-card p-5"
                            style={{ borderColor: `${color}35` }}
                          >
                            {/* Card header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                                  style={{
                                    background: `${color}22`,
                                    border: `1px solid ${color}50`,
                                    color,
                                  }}
                                >
                                  {label}
                                </div>
                                <div>
                                  <p
                                    className="text-sm font-bold"
                                    style={{ color: "#F5E6D8" }}
                                  >
                                    {r.city.name}
                                  </p>
                                  <p
                                    className="text-xs"
                                    style={{ color: "#B7937A" }}
                                  >
                                    {r.city.state}
                                  </p>
                                </div>
                              </div>
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{
                                  background: `${tc}18`,
                                  border: `1px solid ${tc}40`,
                                }}
                              >
                                {r.trend === "warming" ? (
                                  <TrendingUp size={16} style={{ color: tc }} />
                                ) : r.trend === "cooling" ? (
                                  <TrendingDown
                                    size={16}
                                    style={{ color: tc }}
                                  />
                                ) : (
                                  <Minus size={16} style={{ color: tc }} />
                                )}
                              </div>
                            </div>

                            {/* Temps */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="text-center">
                                <p
                                  className="text-xs"
                                  style={{ color: "#B7937A" }}
                                >
                                  Current
                                </p>
                                <p
                                  className="text-xl font-black font-mono"
                                  style={{ color }}
                                >
                                  {r.currentTemp.toFixed(1)}°
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className="text-xs"
                                  style={{ color: "#B7937A" }}
                                >
                                  Year Ago
                                </p>
                                <p
                                  className="text-xl font-black font-mono"
                                  style={{ color: "#B7937A" }}
                                >
                                  {r.pastTemp.toFixed(1)}°
                                </p>
                              </div>
                              <div className="text-center">
                                <p
                                  className="text-xs"
                                  style={{ color: "#B7937A" }}
                                >
                                  Delta
                                </p>
                                <p
                                  className="text-xl font-black font-mono"
                                  style={{ color: tc }}
                                >
                                  {r.delta >= 0 ? "+" : ""}
                                  {r.delta.toFixed(1)}°
                                </p>
                              </div>
                            </div>

                            {/* UHI bar */}
                            <UHISeverityBar delta={r.delta} />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Grouped Bar Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6"
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-5"
                        style={{ color: "#B7937A" }}
                      >
                        12-Month Temperature Trend Comparison
                      </p>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                          data={compareChartData}
                          barGap={6}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="rgba(251,146,60,0.07)"
                          />
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#B7937A",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#B7937A", fontSize: 11 }}
                            tickFormatter={(v) => `${v}°`}
                            domain={[
                              Math.min(
                                resultA.pastTemp,
                                resultA.currentTemp,
                                resultB.pastTemp,
                                resultB.currentTemp,
                              ) - 4,
                              Math.max(
                                resultA.pastTemp,
                                resultA.currentTemp,
                                resultB.pastTemp,
                                resultB.currentTemp,
                              ) + 4,
                            ]}
                          />
                          <Tooltip
                            content={<CompareTooltip />}
                            cursor={{ fill: "rgba(251,146,60,0.05)" }}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: 12,
                              fontSize: 12,
                              color: "#B7937A",
                            }}
                            formatter={(value) => (
                              <span
                                style={{
                                  color:
                                    value === resultA.city.name
                                      ? CITY_A_COLOR
                                      : CITY_B_COLOR,
                                }}
                              >
                                {value}
                              </span>
                            )}
                          />
                          <Bar
                            dataKey={resultA.city.name}
                            fill={`${CITY_A_COLOR}CC`}
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            dataKey={resultB.city.name}
                            fill={`${CITY_B_COLOR}CC`}
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* AI Comparative Feedback */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="glass-card p-6"
                      style={{
                        borderColor: "rgba(34,211,238,0.25)",
                        boxShadow: "0 0 20px rgba(34,211,238,0.06)",
                      }}
                      data-ocid="compare.panel"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{
                            background: "rgba(34,211,238,0.15)",
                            border: "1px solid rgba(34,211,238,0.35)",
                          }}
                        >
                          <span style={{ fontSize: 13 }}>🤖</span>
                        </div>
                        <p
                          className="text-xs font-semibold uppercase tracking-widest"
                          style={{ color: "#B7937A" }}
                        >
                          AI Comparative Analysis
                        </p>
                      </div>
                      <p
                        style={{
                          color: "#F5E6D8",
                          fontSize: 15,
                          lineHeight: 1.7,
                        }}
                      >
                        {generateComparisonFeedback(
                          resultA.city.name,
                          resultA.currentTemp,
                          resultA.pastTemp,
                          resultB.city.name,
                          resultB.currentTemp,
                          resultB.pastTemp,
                        )}
                      </p>
                    </motion.div>

                    {/* Compare Again */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <button
                        type="button"
                        className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 pulse-glow-btn"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(251,146,60,0.18) 0%, rgba(251,146,60,0.08) 100%)",
                          border: "1px solid rgba(251,146,60,0.4)",
                          color: "#fb923c",
                          letterSpacing: "0.03em",
                        }}
                        onClick={handleCompareReset}
                        data-ocid="compare.primary_button"
                      >
                        <RotateCcw size={15} />
                        Compare Again
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-8 px-4"
        style={{ borderTop: `1px solid ${theme.accent}14` }}
      >
        <p className="text-xs" style={{ color: "#6B4F3A" }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: theme.accent, transition: "color 1.2s ease" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
