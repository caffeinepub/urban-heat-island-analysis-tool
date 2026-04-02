import type { WeatherDataPoint } from "../dataEngine";
import { convertTemp } from "../dataEngine";
import { GlassCard } from "./GlassCard";

interface Props {
  data: WeatherDataPoint[];
  unit: "C" | "F";
}

function tempToColor(temp: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (temp - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, ratio));

  if (clamped < 0.25) {
    const t = clamped / 0.25;
    return `rgb(${Math.round(20 + t * 10)}, ${Math.round(80 + t * 120)}, ${Math.round(220 - t * 60)})`;
  }
  if (clamped < 0.5) {
    const t = (clamped - 0.25) / 0.25;
    return `rgb(${Math.round(30 + t * 200)}, ${Math.round(200 + t * 50)}, ${Math.round(160 - t * 130)})`;
  }
  if (clamped < 0.75) {
    const t = (clamped - 0.5) / 0.25;
    return `rgb(${Math.round(230 + t * 20)}, ${Math.round(250 - t * 120)}, ${Math.round(30 - t * 20)})`;
  }
  const t = (clamped - 0.75) / 0.25;
  return `rgb(250, ${Math.round(130 - t * 100)}, ${Math.round(10 - t * 5)})`;
}

const DAY_LABEL_ITEMS = [
  { label: "M", key: "mon" },
  { label: "T", key: "tue" },
  { label: "W", key: "wed" },
  { label: "T", key: "thu" },
  { label: "F", key: "fri" },
  { label: "S", key: "sat" },
  { label: "S", key: "sun" },
];

export function TemperatureHeatmap({ data, unit }: Props) {
  if (data.length === 0) return null;

  const converted = data.map((d) => ({
    ...d,
    displayTemp: convertTemp(d.temp, unit),
  }));

  const temps = converted.map((d) => d.displayTemp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const sym = unit === "F" ? "°F" : "°C";

  const weeks: (typeof converted)[] = [];
  for (let i = 0; i < converted.length; i += 7) {
    weeks.push(converted.slice(i, i + 7));
  }
  const displayWeeks = weeks.slice(-26);

  const legendStops = [
    { color: "rgb(20,80,220)", label: `${Math.round(minTemp)}${sym}` },
    { color: "rgb(30,200,160)", label: "" },
    { color: "rgb(230,250,30)", label: "" },
    { color: "rgb(250,130,10)", label: "" },
    { color: "rgb(250,30,5)", label: `${Math.round(maxTemp)}${sym}` },
  ];

  return (
    <GlassCard id="chart-heatmap" className="col-span-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#22D3EE" }}
          >
            Temperature Heatmap
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#9AA7B7" }}>
            Daily temperature across timeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {legendStops.map((s) => (
            <div key={s.color} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: s.color }}
              />
              {s.label && (
                <span className="text-xs" style={{ color: "#9AA7B7" }}>
                  {s.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-0">
          <div className="flex flex-col gap-1 mr-1 justify-start pt-6">
            {DAY_LABEL_ITEMS.map((item) => (
              <div
                key={item.key}
                className="w-4 h-5 flex items-center justify-center text-xs"
                style={{ color: "#9AA7B7", fontSize: "10px" }}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1 flex-wrap">
            {displayWeeks.map((week) => {
              const weekKey = week[0]?.date || `week-${Math.random()}`;
              return (
                <div key={weekKey} className="flex flex-col gap-1">
                  <div
                    className="text-center text-xs mb-1"
                    style={{
                      color: "#9AA7B7",
                      fontSize: "9px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {week[0]?.date.split(" ")[0] || ""}
                  </div>
                  {DAY_LABEL_ITEMS.map((dayItem) => {
                    const dayIndex = [
                      "mon",
                      "tue",
                      "wed",
                      "thu",
                      "fri",
                      "sat",
                      "sun",
                    ].indexOf(dayItem.key);
                    const dp = week[dayIndex];
                    return (
                      <div
                        key={`${weekKey}-${dayItem.key}`}
                        className="w-5 h-5 rounded-sm transition-all cursor-default"
                        title={
                          dp ? `${dp.date}: ${dp.displayTemp}${sym}` : undefined
                        }
                        style={{
                          background: dp
                            ? tempToColor(dp.displayTemp, minTemp, maxTemp)
                            : "rgba(34,211,238,0.05)",
                          opacity: dp ? 0.85 : 0.2,
                          border: dp
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "1px solid rgba(34,211,238,0.1)",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
