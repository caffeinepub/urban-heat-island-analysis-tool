import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Settings,
  Thermometer,
  X,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "Analysis", icon: BarChart3 },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)",
            boxShadow: "0 0 16px rgba(34,211,238,0.4)",
          }}
        >
          <Thermometer size={18} color="#070A10" strokeWidth={2.5} />
        </div>
        <div>
          <div
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: "#22D3EE", letterSpacing: "0.15em" }}
          >
            UHI AI
          </div>
          <div
            className="text-xs"
            style={{ color: "rgba(154,167,183,0.7)", fontSize: "10px" }}
          >
            Heat Island Analytics
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-4 mb-6 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(34,211,238,0.3), transparent)",
        }}
      />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              className="sidebar-nav-item w-full text-left"
              style={
                isActive
                  ? {
                      background: "rgba(34,211,238,0.15)",
                      color: "#22D3EE",
                      border: "1px solid rgba(34,211,238,0.3)",
                      boxShadow:
                        "0 0 16px rgba(34,211,238,0.12), inset 0 0 8px rgba(34,211,238,0.04)",
                    }
                  : {}
              }
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "#22D3EE" : "#9AA7B7" }}
              />
              <span>{item.label}</span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full pulse-glow"
                  style={{ background: "#22D3EE" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="p-4 mt-auto">
        <div
          className="glass-card p-3 text-center"
          style={{ borderColor: "rgba(139,92,246,0.3)" }}
        >
          <div className="text-xs" style={{ color: "#9AA7B7" }}>
            Powered by
          </div>
          <div
            className="text-xs font-semibold mt-0.5"
            style={{ color: "#8B5CF6" }}
          >
            AI Trend Engine
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl"
        style={{
          background: "rgba(13,20,35,0.8)",
          border: "1px solid rgba(34,211,238,0.3)",
          color: "#22D3EE",
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        data-ocid="nav.menu.toggle"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(7,10,16,0.8)" }}
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileOpen(false);
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close menu"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 z-40 h-full w-60 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(9,13,22,0.97)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(34,211,238,0.15)",
        }}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 z-30"
        style={{
          background: "rgba(9,13,22,0.9)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(34,211,238,0.12)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        <NavContent />
      </aside>
    </>
  );
}
