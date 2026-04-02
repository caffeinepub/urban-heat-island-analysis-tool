import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Info,
  TrendingUp,
} from "lucide-react";
import type { AIInsight } from "../aiEngine";
import { GlassCard } from "./GlassCard";

interface Props {
  insights: AIInsight[];
  loading?: boolean;
  city: string;
}

const InsightIcon = ({ type }: { type: AIInsight["type"] }) => {
  if (type === "warning")
    return <AlertTriangle size={13} style={{ color: "#F97316" }} />;
  if (type === "positive")
    return <CheckCircle2 size={13} style={{ color: "#10B981" }} />;
  return <Info size={13} style={{ color: "#22D3EE" }} />;
};

const insightBorder = (type: AIInsight["type"]): string => {
  if (type === "warning") return "rgba(249,115,22,0.3)";
  if (type === "positive") return "rgba(16,185,129,0.3)";
  return "rgba(34,211,238,0.2)";
};

const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

export function AIInsightsPanel({ insights, loading, city }: Props) {
  return (
    <GlassCard
      data-ocid="ai_insights.panel"
      style={{ borderColor: "rgba(139,92,246,0.3)" }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(139,92,246,0.2)",
            boxShadow: "0 0 12px rgba(139,92,246,0.2)",
          }}
        >
          <Brain size={16} style={{ color: "#8B5CF6" }} />
        </div>
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#8B5CF6" }}
          >
            AI Insights
          </h3>
          <p className="text-xs" style={{ color: "#9AA7B7" }}>
            {city} analysis
          </p>
        </div>
        <div className="ml-auto">
          <TrendingUp size={16} style={{ color: "rgba(139,92,246,0.5)" }} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" data-ocid="ai_insights.loading_state">
          {SKELETON_IDS.map((id, i) => (
            <div
              key={id}
              className="h-12 rounded-xl skeleton-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {insights.map((insight, idx) => (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-all animate-fade-in-up"
              style={{
                background: "rgba(13,20,35,0.5)",
                border: `1px solid ${insightBorder(insight.type)}`,
                animationDelay: `${idx * 60}ms`,
              }}
            >
              <div
                className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <InsightIcon type={insight.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "rgba(139,92,246,0.7)" }}
                  >
                    #{insight.id}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#E6EEF9" }}
                >
                  {insight.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
