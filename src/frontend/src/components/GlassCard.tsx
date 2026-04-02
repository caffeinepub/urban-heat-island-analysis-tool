import { cn } from "@/lib/utils";
import type React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  noPadding?: boolean;
  "data-ocid"?: string;
}

export function GlassCard({
  children,
  className,
  id,
  style,
  onClick,
  noPadding,
  "data-ocid": dataOcid,
}: GlassCardProps) {
  return (
    <div
      id={id}
      data-ocid={dataOcid}
      className={cn(
        "glass-card",
        !noPadding && "p-5",
        onClick && "cursor-pointer",
        className,
      )}
      style={style}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
