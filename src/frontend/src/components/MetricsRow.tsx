import {
  Minus,
  Sun,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { AnalysisResult } from "../aiEngine";
import { convertTemp } from "../dataEngine";
import type { WeatherDataPoint } from "../dataEngine";
import { GlassCard } from "./GlassCard";

interface MetricsRowProps {
  data: WeatherDataPoint[];
  analysis: AnalysisResult | null;
  unit: "C" | "F";
  loading?: boolean;
}

export function MetricsRow({ data, analysis, unit }: MetricsRowProps) {
  const unitSymbol = unit === "F" ? "°F" : "°C";

  const avgTemp =
    data.length > 0
      ? convertTemp(
          Math.round(
            (data.reduce((a, d) => a + d.temp, 0) / data.length) * 10,
          ) / 10,
          unit,
        )
      : 0;

  const maxUhi =
    data.length > 0
      ? Math.round(Math.max(...data.map((d) => d.uhiEffect)) * 10) / 10
      : 0;

  const heatDays = data.filter((d) => d.temp > 35).length;

  const trend = analysis?.trendDirection || "stable";
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "#F97316" : trend === "down" ? "#22D3EE" : "#9AA7B7";

  const metrics = [
    {
      label: "Avg Temperature",
      value: `${avgTemp}${unitSymbol}`,
      sub: "Urban surface average",
      icon: Thermometer,
      color: "#22D3EE",
      glow: "rgba(34,211,238,0.15)",
      ocid: "metrics.avg_temp.card",
    },
    {
      label: "Max UHI Effect",
      value: `+${maxUhi}°C`,
      sub: "vs. rural baseline",
      icon: Zap,
      color: "#8B5CF6",
      glow: "rgba(139,92,246,0.15)",
      ocid: "metrics.max_uhi.card",
    },
    {
      label: "Heat Days",
      value: String(heatDays),
      sub: "Days exceeding 35°C",
      icon: Sun,
      color: "#F97316",
      glow: "rgba(249,115,22,0.15)",
      ocid: "metrics.heat_days.card",
    },
    {
      label: "Trend Direction",
      value:
        trend === "up" ? "Rising" : trend === "down" ? "Cooling" : "Stable",
      sub: analysis
        ? `R² = ${Math.round(analysis.rSquared * 100)}%`
        : "Statistical trend",
      icon: TrendIcon,
      color: trendColor,
      glow: `${trendColor}26`,
      ocid: "metrics.trend.card",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <GlassCard
            key={m.label}
            data-ocid={m.ocid}
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "#9AA7B7", letterSpacing: "0.1em" }}
              >
                {m.label}
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: m.glow }}
              >
                <Icon size={16} style={{ color: m.color }} />
              </div>
            </div>
            <div
              className="text-3xl font-bold tracking-tight mb-1"
              style={{ color: m.color }}
            >
              {m.value}
            </div>
            <div className="text-xs" style={{ color: "#9AA7B7" }}>
              {m.sub}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
