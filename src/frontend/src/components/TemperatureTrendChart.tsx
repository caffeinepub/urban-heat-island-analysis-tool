import { Download } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { WeatherDataPoint } from "../dataEngine";
import { convertTemp } from "../dataEngine";
import { downloadChartAsPng } from "../utils/downloadChart";
import { GlassCard } from "./GlassCard";

interface Props {
  data: WeatherDataPoint[];
  unit: "C" | "F";
  city: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: TooltipProps<ValueType, NameType> & { unit: "C" | "F" }) => {
  if (!active || !payload?.length) return null;
  const sym = unit === "F" ? "°F" : "°C";
  return (
    <div className="chart-tooltip">
      <p className="text-xs font-semibold mb-2" style={{ color: "#9AA7B7" }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: String(p.color) }}
          />
          <span style={{ color: "#9AA7B7" }}>{p.name}:</span>
          <span className="font-semibold" style={{ color: String(p.color) }}>
            {p.value}
            {sym}
          </span>
        </div>
      ))}
    </div>
  );
};

export function TemperatureTrendChart({ data, unit, city }: Props) {
  const sym = unit === "F" ? "°F" : "°C";
  const chartData = data.map((d) => ({
    date: d.date,
    Temperature: convertTemp(d.temp, unit),
    "Heat Index": convertTemp(d.heatIndex, unit),
  }));

  const step = Math.max(1, Math.floor(chartData.length / 60));
  const sampled = chartData.filter((_, i) => i % step === 0);

  return (
    <GlassCard id="chart-temp-trend" noPadding className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#22D3EE" }}
          >
            Temperature Trend
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#9AA7B7" }}>
            {city} — Daily readings
          </p>
        </div>
        <button
          type="button"
          data-ocid="temp_trend.download.button"
          className="btn-glass p-2 rounded-lg flex items-center gap-1.5 text-xs"
          onClick={() =>
            downloadChartAsPng("chart-temp-trend", `uhi-temp-trend-${city}`)
          }
        >
          <Download size={13} />
          PNG
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={sampled}
          margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradHI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(154,167,183,0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#9AA7B7", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(154,167,183,0.15)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#9AA7B7", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}${sym}`}
          />
          <Tooltip
            content={(props) => <CustomTooltip {...props} unit={unit} />}
          />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#9AA7B7" }}
          />
          <Area
            type="monotone"
            dataKey="Temperature"
            stroke="#22D3EE"
            strokeWidth={2}
            fill="url(#gradTemp)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#22D3EE",
              stroke: "#070A10",
              strokeWidth: 2,
            }}
          />
          <Area
            type="monotone"
            dataKey="Heat Index"
            stroke="#8B5CF6"
            strokeWidth={1.5}
            fill="url(#gradHI)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#8B5CF6",
              stroke: "#070A10",
              strokeWidth: 2,
            }}
            strokeDasharray="4 2"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
