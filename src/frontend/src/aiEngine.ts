import type { WeatherDataPoint } from "./dataEngine";

export interface AIInsight {
  id: number;
  text: string;
  type: "info" | "warning" | "positive";
}

export interface AnalysisResult {
  insights: AIInsight[];
  slope: number;
  rSquared: number;
  anomalyCount: number;
  avgUhi: number;
  trendDirection: "up" | "down" | "stable";
  projectedNextWeek: number;
}

function linearRegression(y: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = y.length;
  if (n < 2) return { slope: 0, intercept: y[0] || 0, rSquared: 0 };

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, i) => a + i * y[i], 0);
  const sumX2 = x.reduce((a, i) => a + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTot = y.reduce((a, yi) => a + (yi - meanY) ** 2, 0);
  const ssRes = y.reduce(
    (a, yi, i) => a + (yi - (slope * i + intercept)) ** 2,
    0,
  );
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

function detectAnomalies(temps: number[]): number[] {
  if (temps.length < 3) return [];
  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const variance =
    temps.reduce((a, b) => a + (b - mean) ** 2, 0) / temps.length;
  const stdDev = Math.sqrt(variance);
  return temps
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t > mean + 2 * stdDev || t < mean - 2 * stdDev)
    .map(({ i }) => i);
}

export function analyzeWeatherData(
  data: WeatherDataPoint[],
  unit: "C" | "F" = "C",
): AnalysisResult {
  if (data.length === 0) {
    return {
      insights: [
        { id: 1, text: "No data available for analysis.", type: "info" },
      ],
      slope: 0,
      rSquared: 0,
      anomalyCount: 0,
      avgUhi: 0,
      trendDirection: "stable",
      projectedNextWeek: 0,
    };
  }

  const temps = data.map((d) => d.temp);
  const { slope, rSquared } = linearRegression(temps);
  const anomalies = detectAnomalies(temps);
  const avgUhi =
    Math.round((data.reduce((a, d) => a + d.uhiEffect, 0) / data.length) * 10) /
    10;
  const totalChange = Math.round(slope * (data.length - 1) * 10) / 10;
  const lastTemp = temps[temps.length - 1];
  const projectedNextWeek = Math.round((lastTemp + slope * 7) * 10) / 10;
  const trendDirection =
    Math.abs(slope) < 0.05 ? "stable" : slope > 0 ? "up" : "down";

  const unitSymbol = unit === "F" ? "°F" : "°C";
  const convertVal = (v: number) =>
    unit === "F" ? Math.round((v * 9) / 5) : v;

  const insights: AIInsight[] = [];
  let id = 1;

  if (Math.abs(totalChange) > 0.1) {
    const dir = totalChange > 0 ? "increased" : "decreased";
    insights.push({
      id: id++,
      text: `Temperature ${dir} by ${Math.abs(convertVal(totalChange))}${unitSymbol} over the selected period`,
      type: totalChange > 0 ? "warning" : "positive",
    });
  } else {
    insights.push({
      id: id++,
      text: "Temperature remained stable over the selected period",
      type: "info",
    });
  }

  if (anomalies.length > 0) {
    insights.push({
      id: id++,
      text: `${anomalies.length} anomalous heat ${anomalies.length === 1 ? "day" : "days"} detected in dataset`,
      type: "warning",
    });
  }

  const projChange = Math.round((projectedNextWeek - lastTemp) * 10) / 10;
  if (Math.abs(projChange) > 0.2) {
    const dir = projChange > 0 ? "+" : "";
    insights.push({
      id: id++,
      text: `Trend projects ${dir}${convertVal(projChange)}${unitSymbol} change over next 7 days`,
      type: projChange > 1.5 ? "warning" : "info",
    });
  }

  insights.push({
    id: id++,
    text: `Average UHI effect: ${avgUhi}°C above rural baseline`,
    type: avgUhi > 3.5 ? "warning" : "info",
  });

  const avgHumidity =
    Math.round((data.reduce((a, d) => a + d.humidity, 0) / data.length) * 10) /
    10;
  insights.push({
    id: id++,
    text: `Average relative humidity: ${avgHumidity}% — ${avgHumidity > 70 ? "high moisture stress" : avgHumidity > 50 ? "moderate humidity" : "comfortable levels"}`,
    type: avgHumidity > 70 ? "warning" : "info",
  });

  if (rSquared > 0.6) {
    insights.push({
      id: id++,
      text: `Strong statistical trend detected (R² = ${Math.round(rSquared * 100)}%) — high confidence forecast`,
      type: "positive",
    });
  } else if (rSquared > 0.3) {
    insights.push({
      id: id++,
      text: `Moderate trend signal (R² = ${Math.round(rSquared * 100)}%) with natural variability`,
      type: "info",
    });
  } else {
    insights.push({
      id: id++,
      text: `High variability in data (R² = ${Math.round(rSquared * 100)}%) — short-term fluctuations dominant`,
      type: "info",
    });
  }

  const highDays = data.filter((d) => d.temp > 35).length;
  if (highDays > 0) {
    insights.push({
      id: id++,
      text: `${highDays} extreme heat ${highDays === 1 ? "day" : "days"} (>35°C) detected — elevated health risk`,
      type: "warning",
    });
  }

  return {
    insights,
    slope,
    rSquared,
    anomalyCount: anomalies.length,
    avgUhi,
    trendDirection,
    projectedNextWeek,
  };
}
