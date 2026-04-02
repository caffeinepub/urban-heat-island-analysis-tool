import { subDays } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type AnalysisResult, analyzeWeatherData } from "../aiEngine";
import { type WeatherDataPoint, generateWeatherData } from "../dataEngine";
import { useGetCities } from "../hooks/useQueries";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { CitySelector } from "./CitySelector";
import { DailyComparisonChart } from "./DailyComparisonChart";
import { GlassCard } from "./GlassCard";
import { HeatIntensityPieChart } from "./HeatIntensityPieChart";
import { MetricsRow } from "./MetricsRow";
import { SkeletonCard } from "./SkeletonCard";
import { TemperatureHeatmap } from "./TemperatureHeatmap";
import { TemperatureTrendChart } from "./TemperatureTrendChart";
import { TimelinePicker, type TimelineValue } from "./TimelinePicker";
import { UnitToggle } from "./UnitToggle";

const SKELETON_IDS = ["sk-m1", "sk-m2", "sk-m3", "sk-m4"];

export function Dashboard() {
  const [city, setCity] = useState("New York");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [timeline, setTimeline] = useState<TimelineValue>({
    preset: "30D",
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [weatherData, setWeatherData] = useState<WeatherDataPoint[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: backendCities } = useGetCities();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(
    (selectedCity: string, start: Date, end: Date) => {
      setLoading(true);
      const timer = setTimeout(() => {
        const data = generateWeatherData(selectedCity, start, end);
        const result = analyzeWeatherData(data, unit);
        setWeatherData(data);
        setAnalysis(result);
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    },
    [unit],
  );

  useEffect(() => {
    loadData(city, timeline.startDate, timeline.endDate);
  }, [city, timeline, loadData]);

  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-10 lg:pt-0">
        <div>
          <h1
            className="text-xl lg:text-2xl font-black uppercase tracking-widest leading-tight"
            style={{
              color: "#E6EEF9",
              letterSpacing: "0.12em",
              textShadow: "0 0 30px rgba(34,211,238,0.15)",
            }}
          >
            Urban Heat Island
          </h1>
          <div
            className="text-xs lg:text-sm font-semibold uppercase tracking-widest mt-0.5"
            style={{ color: "#22D3EE", letterSpacing: "0.15em" }}
          >
            AI Analysis Dashboard
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div
              className="text-base font-mono font-semibold"
              style={{ color: "#22D3EE" }}
            >
              {timeStr}
            </div>
            <div className="text-xs" style={{ color: "#9AA7B7" }}>
              {dateStr}
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full pulse-glow"
              style={{ background: "#10B981" }}
            />
            <span className="text-xs font-medium" style={{ color: "#10B981" }}>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(34,211,238,0.3), transparent)",
        }}
      />

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="flex flex-col gap-2">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "#9AA7B7" }}
          >
            <MapPin size={11} className="inline mr-1" />
            City
          </div>
          <CitySelector
            value={city}
            onChange={setCity}
            cities={backendCities}
          />
        </GlassCard>

        <GlassCard className="flex flex-col gap-2 sm:col-span-1">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "#9AA7B7" }}
          >
            <Clock size={11} className="inline mr-1" />
            Timeline
          </div>
          <TimelinePicker value={timeline} onChange={setTimeline} />
        </GlassCard>

        <GlassCard className="flex flex-col gap-2">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "#9AA7B7" }}
          >
            Temperature Unit
          </div>
          <UnitToggle unit={unit} onChange={setUnit} />
        </GlassCard>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SKELETON_IDS.map((id) => (
            <SkeletonCard key={id} height="h-28" />
          ))}
        </div>
      ) : (
        <MetricsRow data={weatherData} analysis={analysis} unit={unit} />
      )}

      {/* Main Charts */}
      {loading ? (
        <SkeletonCard height="h-80" />
      ) : (
        <TemperatureTrendChart data={weatherData} unit={unit} city={city} />
      )}

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <>
            <SkeletonCard height="h-72" />
            <SkeletonCard height="h-72" />
          </>
        ) : (
          <>
            <DailyComparisonChart data={weatherData} unit={unit} />
            <HeatIntensityPieChart data={weatherData} />
          </>
        )}
      </div>

      {/* Heatmap + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {loading ? (
            <SkeletonCard height="h-64" />
          ) : (
            <TemperatureHeatmap data={weatherData} unit={unit} />
          )}
        </div>
        <div>
          <AIInsightsPanel
            insights={analysis?.insights || []}
            loading={loading}
            city={city}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-center py-4 text-xs"
        style={{ color: "rgba(154,167,183,0.5)" }}
      >
        © {new Date().getFullYear()}. Built with{" "}
        <span style={{ color: "#22D3EE" }}>♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#22D3EE" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
