interface UnitToggleProps {
  unit: "C" | "F";
  onChange: (unit: "C" | "F") => void;
}

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: "rgba(13,20,35,0.8)",
        border: "1px solid rgba(34,211,238,0.2)",
      }}
    >
      <button
        type="button"
        data-ocid="unit.celsius.toggle"
        className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
        style={{
          background: unit === "C" ? "rgba(34,211,238,0.2)" : "transparent",
          color: unit === "C" ? "#22D3EE" : "#9AA7B7",
          boxShadow: unit === "C" ? "0 0 12px rgba(34,211,238,0.25)" : "none",
          border:
            unit === "C"
              ? "1px solid rgba(34,211,238,0.4)"
              : "1px solid transparent",
        }}
        onClick={() => onChange("C")}
      >
        °C
      </button>
      <button
        type="button"
        data-ocid="unit.fahrenheit.toggle"
        className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
        style={{
          background: unit === "F" ? "rgba(139,92,246,0.2)" : "transparent",
          color: unit === "F" ? "#8B5CF6" : "#9AA7B7",
          boxShadow: unit === "F" ? "0 0 12px rgba(139,92,246,0.25)" : "none",
          border:
            unit === "F"
              ? "1px solid rgba(139,92,246,0.4)"
              : "1px solid transparent",
        }}
        onClick={() => onChange("F")}
      >
        °F
      </button>
    </div>
  );
}
