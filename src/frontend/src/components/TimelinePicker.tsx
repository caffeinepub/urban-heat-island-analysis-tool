import { format, subDays } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";

export type TimelinePreset = "7D" | "30D" | "90D" | "1Y" | "custom";

export interface TimelineValue {
  preset: TimelinePreset;
  startDate: Date;
  endDate: Date;
}

const PRESETS: { id: TimelinePreset; label: string; days: number }[] = [
  { id: "7D", label: "7D", days: 7 },
  { id: "30D", label: "30D", days: 30 },
  { id: "90D", label: "90D", days: 90 },
  { id: "1Y", label: "1Y", days: 365 },
];

interface TimelinePickerProps {
  value: TimelineValue;
  onChange: (value: TimelineValue) => void;
}

export function TimelinePicker({ value, onChange }: TimelinePickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  const handlePreset = (preset: { id: TimelinePreset; days: number }) => {
    const endDate = new Date();
    const startDate = subDays(endDate, preset.days);
    onChange({ preset: preset.id, startDate, endDate });
    setShowCustom(false);
  };

  const handleCustomStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value);
    onChange({ ...value, preset: "custom", startDate });
  };

  const handleCustomEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = new Date(e.target.value);
    onChange({ ...value, preset: "custom", endDate });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          type="button"
          key={p.id}
          data-ocid={`timeline.${p.id.toLowerCase()}.tab`}
          className={`btn-glass px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            value.preset === p.id ? "active" : ""
          }`}
          onClick={() => handlePreset(p)}
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        data-ocid="timeline.custom.tab"
        className={`btn-glass px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
          value.preset === "custom" ? "active" : ""
        }`}
        onClick={() => setShowCustom(!showCustom)}
      >
        <Calendar size={12} />
        Custom
      </button>

      {(showCustom || value.preset === "custom") && (
        <div className="flex items-center gap-2 w-full mt-1">
          <input
            type="date"
            data-ocid="timeline.start.input"
            value={format(value.startDate, "yyyy-MM-dd")}
            onChange={handleCustomStart}
            className="text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.2)",
              color: "#E6EEF9",
              colorScheme: "dark",
            }}
          />
          <span className="text-xs" style={{ color: "#9AA7B7" }}>
            to
          </span>
          <input
            type="date"
            data-ocid="timeline.end.input"
            value={format(value.endDate, "yyyy-MM-dd")}
            onChange={handleCustomEnd}
            className="text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.2)",
              color: "#E6EEF9",
              colorScheme: "dark",
            }}
          />
        </div>
      )}
    </div>
  );
}
