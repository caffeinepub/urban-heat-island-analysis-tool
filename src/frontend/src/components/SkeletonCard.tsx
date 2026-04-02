import { GlassCard } from "./GlassCard";

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

export function SkeletonCard({
  height = "h-40",
  className,
}: SkeletonCardProps) {
  return (
    <GlassCard className={`${height} ${className || ""} overflow-hidden`}>
      <div className="skeleton-pulse w-full h-full rounded-xl" />
    </GlassCard>
  );
}

export function SkeletonMetric() {
  return (
    <GlassCard className="flex-1 min-w-[160px]">
      <div className="space-y-3">
        <div className="skeleton-pulse h-3 w-20 rounded" />
        <div className="skeleton-pulse h-8 w-28 rounded" />
        <div className="skeleton-pulse h-3 w-16 rounded" />
      </div>
    </GlassCard>
  );
}
