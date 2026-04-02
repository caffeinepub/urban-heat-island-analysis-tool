import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
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

export function DailyComparisonChart({ data, unit }: Props) {
  const sym = unit === "F" ? "°F" : "°C";

  const aggregated: { week: string; Avg: number; Max: number; Min: number }[] =
    [];
  const chunkSize = Math.max(1, Math.ceil(data.length / 12));
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const temps = chunk.map((d) => convertTemp(d.temp, unit));
    aggregated.push({
      week: chunk[0].date,
      Avg:
        Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
      Max: Math.round(Math.max(...temps) * 10) / 10,
      Min: Math.round(Math.min(...temps) * 10) / 10,
    });
  }

  return (
    <GlassCard id="chart-daily-bar" noPadding className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#22D3EE" }}
          >
            Daily Comparison
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#9AA7B7" }}>
            Avg / Max / Min
          </p>
        </div>
        <button
          type="button"
          data-ocid="daily_bar.download.button"
          className="btn-glass p-2 rounded-lg flex items-center gap-1.5 text-xs"
          onClick={() =>
            downloadChartAsPng("chart-daily-bar", "uhi-daily-comparison")
          }
        >
          <Download size={13} />
          PNG
        </button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={aggregated}
          margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          barGap={2}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(154,167,183,0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={{ fill: "#9AA7B7", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(154,167,183,0.15)" }}
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
          <Bar
            dataKey="Max"
            fill="#22D3EE"
            fillOpacity={0.85}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="Avg"
            fill="#8B5CF6"
            fillOpacity={0.75}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="Min"
            fill="rgba(34,211,238,0.3)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
