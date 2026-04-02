import { Download } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { WeatherDataPoint } from "../dataEngine";
import { getHeatIntensityDistribution } from "../dataEngine";
import { downloadChartAsPng } from "../utils/downloadChart";
import { GlassCard } from "./GlassCard";

interface Props {
  data: WeatherDataPoint[];
}

const COLORS = {
  Low: "#22D3EE",
  Medium: "#8B5CF6",
  High: "#F97316",
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="chart-tooltip">
      <div className="flex items-center gap-2 text-xs">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: p.payload.fill }}
        />
        <span style={{ color: "#E6EEF9" }}>{p.name}:</span>
        <span className="font-semibold" style={{ color: p.payload.fill }}>
          {p.value}%
        </span>
      </div>
    </div>
  );
};

export function HeatIntensityPieChart({ data }: Props) {
  const dist = getHeatIntensityDistribution(data);
  const chartData = [
    { name: "Low", value: dist.low, fill: COLORS.Low },
    { name: "Medium", value: dist.medium, fill: COLORS.Medium },
    { name: "High", value: dist.high, fill: COLORS.High },
  ].filter((d) => d.value > 0);

  return (
    <GlassCard id="chart-heat-pie" noPadding className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#22D3EE" }}
          >
            Heat Intensity
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#9AA7B7" }}>
            Distribution
          </p>
        </div>
        <button
          type="button"
          data-ocid="heat_pie.download.button"
          className="btn-glass p-2 rounded-lg flex items-center gap-1.5 text-xs"
          onClick={() =>
            downloadChartAsPng("chart-heat-pie", "uhi-heat-intensity")
          }
        >
          <Download size={13} />
          PNG
        </button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={entry.fill}
                opacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#9AA7B7", paddingTop: 8 }}
            formatter={(value, entry) => {
              const e = entry as { payload?: { value: number; fill: string } };
              return (
                <span style={{ color: e.payload?.fill || "#9AA7B7" }}>
                  {value} ({e.payload?.value}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
