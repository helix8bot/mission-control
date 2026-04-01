"use client";

import { useState, useEffect } from "react";

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

const StatusDot = ({ status, size = 8 }: { status: string; size?: number }) => {
  const colors: Record<string, string> = { healthy: "#34D399", warning: "#FBBF24", critical: "#EF4444", neutral: "#94A3B8" };
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      backgroundColor: colors[status] || colors.neutral,
      boxShadow: `0 0 6px ${colors[status] || colors.neutral}40`,
    }} />
  );
};

const ProgressBar = ({ value, max, color = "#c9a962", height = 4 }: { value: number; max: number; color?: string; height?: number }) => (
  <div style={{ width: "100%", height, backgroundColor: "#1a1f30", borderRadius: height / 2, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(Math.max((value / max) * 100, 1), 100)}%`, height: "100%", backgroundColor: color, borderRadius: height / 2, transition: "width 1s ease" }} />
  </div>
);

const SparkLine = ({ data, color = "#c9a962", height = 40, width = 120 }: { data: number[]; color?: string; height?: number; width?: number }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  const gradId = `sg-${color.replace('#', '')}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", width: "100%" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

interface Task { title: string; status: string; assignee: string; due: string; priority?: string; }
interface Signal { signal: string; source: string; priority: string; }
interface TeamMember { name: string; role: string; tasks: number; status: string; type?: "ai" | "human"; }
interface WcSales {
  lastUpdated: string;
  currentMonth: { label: string; period: string; orders: number; revenue: number; customers: number; aov: number; daysElapsed: number; };
  today: { date: string; orders: number; revenue: number; };
  topProducts: { name: string; qty: number; revenue: number; }[];
  dailyBreakdown: Record<string, { orders: number; revenue: number; }>;
  customerMetrics?: { totalCustomers6mo: number; repeatCustomers: number; repeatPct: number; avgOrdersRepeat: number; avgDaysBetweenOrders: number; periodLabel: string; };
}
interface InventoryItem { name: string; stock: number; daysSupply: number; status: string; price?: string; totalSales?: number; }
interface InventoryData { lastUpdated: string; source: string; items: InventoryItem[]; summary?: { total: number; critical: number; warning: number; ok: number; healthy: number; totalUnits: number; }; }

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("home");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const t = setInterval(() => setTime(new Date()), 1000);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => { clearInterval(t); window.removeEventListener("resize", handleResize); };
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [teamData, setTeam] = useState<TeamMember[]>([]);
  const [usage, setUsage] = useState({ today: 0, month: 0, tokensToday: 0 });
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [wcSales, setWcSales] = useState<WcSales | null>(null);
  const [cronJobs, setCronJobs] = useState<{ name: string; schedule: string; lastStatus: string; health: string; lastDuration: number; enabled: boolean }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, socialRes, memoryRes, usageRes, inventoryRes, wcSalesRes] = await Promise.all([
          fetch('/data/tasks.json').catch(() => null),
          fetch('/data/social.json').catch(() => null),
          fetch('/data/memory.json').catch(() => null),
          fetch('/data/usage.json').catch(() => null),
          fetch('/data/inventory.json').catch(() => null),
          fetch('/data/wc-sales.json').catch(() => null),
        ]);
        if (tasksRes?.ok) { const d = await tasksRes.json(); setTasks(d); }
        if (inventoryRes?.ok) { const d = await inventoryRes.json(); setInventoryData(d); }
        if (wcSalesRes?.ok) { const d = await wcSalesRes.json(); setWcSales(d); }
        const cronRes = await fetch('/data/cron-health.json').catch(() => null);
        if (cronRes?.ok) { const d = await cronRes.json(); setCronJobs(d.jobs || []); }
        if (socialRes?.ok) { const d = await socialRes.json(); setSignals(d.topSignals || []); }
        if (memoryRes?.ok) {
          const d = await memoryRes.json();
          if (d.team) setTeam(d.team.map((t: any) => ({ name: t.name, role: t.role, tasks: 0, status: "healthy" })));
        }
        if (usageRes?.ok) {
          const d = await usageRes.json();
          const now = new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const currentMonth = today.slice(0, 7);
          let dailyData = d.dailyUsage?.[today];
          // Fall back to most recent day if today has no data yet
          if (!dailyData && d.dailyUsage) {
            const dates = Object.keys(d.dailyUsage).sort();
            const latest = dates[dates.length - 1];
            if (latest) dailyData = d.dailyUsage[latest];
          }
          const monthCost = d.monthlyUsage?.[currentMonth]?.estimatedCost || 0;
          setUsage({
            today: dailyData?.estimatedCost || 0,
            month: monthCost,
            tokensToday: (dailyData?.totalInputTokens || 0) + (dailyData?.totalOutputTokens || 0),
          });
        }
      } catch (e) { console.error('Fetch error:', e); }
    };
    fetchAll();
  }, []);

  const inventory = inventoryData?.items || [];
  const invSummary = inventoryData?.summary;

  // Financial data from WC sales (live) with fallbacks
  const monthLabel = wcSales?.currentMonth?.label || "Mar";
  const elixserRevenue = wcSales?.currentMonth?.revenue || 0;
  const elixserOrders = wcSales?.currentMonth?.orders || 0;
  const elixserCustomers = wcSales?.currentMonth?.customers || 0;
  const elixserAov = wcSales?.currentMonth?.aov || 0;
  const todayRevenue = wcSales?.today?.revenue || 0;
  const todayOrders = wcSales?.today?.orders || 0;
  const repeatPct = wcSales?.customerMetrics?.repeatPct || 0;
  const repeatCustomers = wcSales?.customerMetrics?.repeatCustomers || 0;
  const totalCustomers6mo = wcSales?.customerMetrics?.totalCustomers6mo || 0;
  const avgDaysBetween = wcSales?.customerMetrics?.avgDaysBetweenOrders || 0;

  // Revenue history: keep historical + add current from WC
  const revenueHistory = [4593, 35346, 65725, 14169, elixserRevenue];
  const revenueLabels = ["Nov", "Dec", "Jan", "Feb", monthLabel];

  // Daily revenue sparkline for current month
  const dailyRevenues = wcSales?.dailyBreakdown ? Object.values(wcSales.dailyBreakdown).map(d => d.revenue) : [];

  const completedTasks = tasks.filter((t: any) => t.status === "Done").length;
  const inProgress = tasks.filter((t: any) => t.status === "In Progress").length;
  const toDo = tasks.filter((t: any) => t.status === "To Do").length;
  const pausedTasks = tasks.filter((t: any) => t.status === "Paused").length;

  const normalizeAssignee = (assignee: string) => assignee.replace(/\s*\(Human\)\s*$/, "").trim();
  const getActiveTasksForMember = (name: string) => tasks.filter((t: any) => normalizeAssignee(t.assignee) === name && t.status !== "Done");

  const aiTeamBase: TeamMember[] = teamData.length > 0 ? teamData.map(m => ({
    ...m,
    type: "ai" as const,
    tasks: getActiveTasksForMember(m.name).length,
    status: getActiveTasksForMember(m.name).length > 5 ? "warning" : "healthy",
  })) : [
    { name: "Helix", role: "COO", tasks: 0, status: "healthy", type: "ai" },
    { name: "Luna", role: "Marketing", tasks: 0, status: "healthy", type: "ai" },
    { name: "Xena", role: "Research", tasks: 0, status: "healthy", type: "ai" },
    { name: "Zara", role: "Product", tasks: 0, status: "healthy", type: "ai" },
    { name: "Kira", role: "Operations", tasks: 0, status: "healthy", type: "ai" },
    { name: "Zoe", role: "Finance", tasks: 0, status: "healthy", type: "ai" },
  ];

  const humanTeamBase: TeamMember[] = [
    { name: "Lyn", role: "Operations Manager", tasks: 0, status: "healthy", type: "human" },
    { name: "Anmol", role: "Media Buyer / Ad Operations", tasks: 0, status: "healthy", type: "human" },
    { name: "Ivy", role: "Supplier Relations / Inventory", tasks: 0, status: "healthy", type: "human" },
  ];

  const humanTeam = humanTeamBase.map(m => ({
    ...m,
    tasks: getActiveTasksForMember(m.name).length,
    status: getActiveTasksForMember(m.name).length > 5 ? "warning" : "healthy",
  }));

  const team = [...aiTeamBase, ...humanTeam];

  const displaySignals = signals.length > 0 ? signals : [
    { signal: "RFK Jr. removing 14 peptides from FDA ban list", source: "Regulatory", priority: "high" },
    { signal: "Growing demand for peptide dosing education", source: "r/Peptides", priority: "high" },
    { signal: "BPC-157 gummy market has limited competition", source: "Market Intel", priority: "medium" },
  ];

  const tabConfig = [
    { id: "home", icon: "\u25C6", label: "Home" },
    { id: "inventory", icon: "\uD83D\uDCE6", label: "Inventory" },
    { id: "tasks", icon: "\u25A3", label: "Tasks" },
    { id: "signals", icon: "\u26A1", label: "Signals" },
    { id: "team", icon: "\u25CE", label: "Team" },
    { id: "crons", icon: "\u23F1", label: "Crons" },
  ];

  const cardStyle = (accent = false) => ({
    background: accent ? "linear-gradient(135deg, #1a1f2e 0%, #0f1219 100%)" : "linear-gradient(180deg, #12151e 0%, #0d1017 100%)",
    borderRadius: isMobile ? 14 : 16,
    border: accent ? "1px solid #c9a96230" : "1px solid #1e2333",
    padding: isMobile ? 18 : 28,
    marginBottom: isMobile ? 12 : 0,
  });

  const sectionLabel = (icon: string, text: string, sub?: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isMobile ? 14 : 20, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#c9a962" }}>
      <span style={{ fontSize: 14 }}>{icon}</span>{text}
      {sub && <span style={{ fontSize: 9, color: "#4a5170", fontWeight: 400, letterSpacing: "0.02em", textTransform: "none" as const, marginLeft: "auto" }}>{sub}</span>}
    </div>
  );

  const metricBlock = (label: string, value: string, sub?: string, trend?: number) => (
    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
      <div style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: "#6b7394", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 600, color: "#f0ece4", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</span>
        {trend !== undefined && trend !== 0 && <span style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, color: trend > 0 ? "#34D399" : "#EF4444" }}>{trend > 0 ? "\u2191" : "\u2193"} {Math.abs(trend)}%</span>}
      </div>
      {sub && <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "#4a5170", marginTop: 3 }}>{sub}</div>}
    </div>
  );

  const formatLastUpdated = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch { return ""; }
  };

  const elixserTarget = 50000;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0d14", color: "#f0ece4", fontFamily: "'DM Sans', sans-serif", paddingBottom: isMobile ? 72 : 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0d14; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e2333; border-radius: 2px; }
      `}</style>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "16px 20px" : "20px 40px", borderBottom: "1px solid #141825", position: isMobile ? "sticky" : "relative", top: 0, zIndex: 10, backgroundColor: "#0a0d14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, background: "linear-gradient(135deg, #c9a962 0%, #8b7340 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "#0a0d14" }}>MC</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 15 : 18, fontWeight: 600, color: "#f0ece4" }}>Mission Control</div>
            {!isMobile && <div style={{ fontSize: 11, color: "#4a5170", marginTop: 1 }}>Elixser Peptides</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: isMobile ? 12 : 13, color: "#c8cde0", fontWeight: 500 }}>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
            {!isMobile && <div style={{ fontSize: 10, color: "#4a5170" }}>{time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "4px 8px" : "6px 12px", backgroundColor: "#34D39915", borderRadius: 6, border: "1px solid #34D39930" }}>
            <StatusDot status="healthy" size={6} />
            {!isMobile && <span style={{ fontSize: 11, color: "#34D399", fontWeight: 500 }}>Live Data</span>}
          </div>
        </div>
      </header>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 4, padding: "12px 40px", borderBottom: "1px solid #0f1219" }}>
          {tabConfig.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? "#c9a962" : "#6b7394", backgroundColor: activeTab === tab.id ? "#c9a96210" : "transparent", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s ease" }}>
                {tab.icon} {tab.label}
              </button>
          ))}
        </nav>
      )}

      <main style={{ padding: isMobile ? "16px 16px 24px" : "28px 40px", maxWidth: 1440, margin: "0 auto" }}>
        {activeTab === "home" && (
          <>
            {/* Revenue Card - Live from WooCommerce */}
            <div style={cardStyle(true)}>
              {sectionLabel("\u25C6", "Revenue", wcSales?.lastUpdated ? `Updated ${formatLastUpdated(wcSales.lastUpdated)}` : undefined)}
              <div>
                {metricBlock(`Elixser DTC \u2014 ${monthLabel}`, formatCurrency(elixserRevenue), `Target: ${formatCurrency(elixserTarget)} \u00B7 ${elixserOrders} orders \u00B7 ${elixserCustomers} customers`)}
                <ProgressBar value={elixserRevenue} max={elixserTarget} />
                <div style={{ fontSize: 11, color: "#4a5170", marginTop: 6 }}>{((elixserRevenue / elixserTarget) * 100).toFixed(1)}% to target</div>
              </div>
            </div>

            {/* Key Metrics - Live */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr", gap: isMobile ? 10 : 20, marginTop: isMobile ? 12 : 20 }}>
              {[
                { label: `${monthLabel} AOV`, value: `$${elixserAov.toFixed(0)}`, color: "#f0ece4" },
                { label: `${monthLabel} Orders`, value: `${elixserOrders}`, color: "#f0ece4" },
                { label: `${monthLabel} Customers`, value: `${elixserCustomers}`, color: "#f0ece4" },
                { label: "Repeat Buyers", value: `${repeatPct}%`, color: repeatPct >= 40 ? "#34D399" : repeatPct >= 20 ? "#FBBF24" : "#EF4444" },
                { label: "Today Revenue", value: formatCurrency(todayRevenue), color: "#34D399" },
                { label: "Today Orders", value: `${todayOrders}`, color: "#34D399" },
              ].map((m, i) => (
                <div key={i} style={{ ...cardStyle(), padding: isMobile ? 14 : 20, textAlign: "center" as const }}>
                  <div style={{ fontSize: 10, color: "#6b7394", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{m.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 22 : 28, fontWeight: 600, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Revenue Trend + Inventory Summary */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20, marginTop: isMobile ? 12 : 20 }}>
              <div style={cardStyle()}>
                {sectionLabel("\u25C8", "Revenue Trend (DTC)")}
                <SparkLine data={revenueHistory} height={50} width={200} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a5170", marginTop: 8 }}>
                  {revenueLabels.map((l, i) => (
                    <span key={l} style={i === revenueLabels.length - 1 ? { color: "#c9a962", fontWeight: 600 } : {}}>{l}</span>
                  ))}
                </div>
                {dailyRevenues.length > 1 && (
                  <>
                    <div style={{ fontSize: 10, color: "#4a5170", marginTop: 16, marginBottom: 4 }}>{monthLabel} daily revenue</div>
                    <SparkLine data={dailyRevenues} height={30} width={200} color="#34D399" />
                  </>
                )}
              </div>
              <div style={cardStyle()}>
                {sectionLabel("\uD83D\uDCE6", "Inventory Health", inventoryData?.lastUpdated ? `Updated ${formatLastUpdated(inventoryData.lastUpdated)}` : undefined)}
                {invSummary && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ textAlign: "center" as const, padding: "12px 8px", backgroundColor: "#EF444415", borderRadius: 8, border: "1px solid #EF444430" }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#EF4444" }}>{invSummary.critical}</div>
                      <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 600, letterSpacing: "0.06em" }}>STOCKOUT</div>
                    </div>
                    <div style={{ textAlign: "center" as const, padding: "12px 8px", backgroundColor: "#FBBF2410", borderRadius: 8 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#FBBF24" }}>{invSummary.warning}</div>
                      <div style={{ fontSize: 10, color: "#FBBF24", fontWeight: 600, letterSpacing: "0.06em" }}>LOW</div>
                    </div>
                    <div style={{ textAlign: "center" as const, padding: "12px 8px", backgroundColor: "#34D39910", borderRadius: 8 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#34D399" }}>{invSummary.ok + invSummary.healthy}</div>
                      <div style={{ fontSize: 10, color: "#34D399", fontWeight: 600, letterSpacing: "0.06em" }}>IN STOCK</div>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#4a5170" }}>{invSummary?.totalUnits?.toLocaleString() || 0} total units across {invSummary?.total || 0} SKUs</div>
                {inventory.filter(i => i.status === "critical").length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em" }}>STOCKOUTS</div>
                    {inventory.filter(i => i.status === "critical").map((item, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#EF4444", padding: "3px 0", opacity: 0.8 }}>{item.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Products + Sprint Progress */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20, marginTop: isMobile ? 12 : 20 }}>
              <div style={cardStyle()}>
                {sectionLabel("\u25C6", `Top Products \u2014 ${monthLabel}`)}
                {(wcSales?.topProducts || []).slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #1a1f2e" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 11, color: "#4a5170", width: 16 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12, color: "#c8cde0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#6b7394" }}>{p.qty} sold</span>
                      <span style={{ fontSize: 11, color: "#c9a962", fontWeight: 600 }}>${p.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
                {(!wcSales?.topProducts || wcSales.topProducts.length === 0) && (
                  <div style={{ fontSize: 12, color: "#3a3f52", fontStyle: "italic" }}>No sales data yet</div>
                )}
              </div>
              <div style={cardStyle()}>
                {sectionLabel("\u25CE", "Customer Health", wcSales?.customerMetrics?.periodLabel)}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ textAlign: "center" as const, padding: "12px 8px", backgroundColor: repeatPct >= 20 ? "#34D39910" : "#EF444415", borderRadius: 8 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: repeatPct >= 40 ? "#34D399" : repeatPct >= 20 ? "#FBBF24" : "#EF4444" }}>{repeatPct}%</div>
                    <div style={{ fontSize: 10, color: "#6b7394", fontWeight: 600, letterSpacing: "0.06em" }}>REPEAT RATE</div>
                  </div>
                  <div style={{ textAlign: "center" as const, padding: "12px 8px", backgroundColor: "#0e1119", borderRadius: 8 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#f0ece4" }}>{avgDaysBetween || "—"}</div>
                    <div style={{ fontSize: 10, color: "#6b7394", fontWeight: 600, letterSpacing: "0.06em" }}>AVG DAYS BETWEEN</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#4a5170" }}>
                  {repeatCustomers} of {totalCustomers6mo} customers reordered{avgDaysBetween > 0 ? ` · avg ${avgDaysBetween} days` : ""}
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: "#6b7394", marginBottom: 4 }}>Repeat rate vs 40% target</div>
                  <ProgressBar value={repeatPct} max={40} color={repeatPct >= 40 ? "#34D399" : repeatPct >= 20 ? "#FBBF24" : "#EF4444"} height={4} />
                </div>
              </div>
            </div>

            {/* Signals */}
            <div style={{ ...cardStyle(), marginTop: isMobile ? 12 : 20 }}>
              {sectionLabel("\u26A1", "Top Signals")}
              {displaySignals.slice(0, 3).map((s, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? "1px solid #1a1f2e" : "none", animation: `fadeIn 0.4s ease ${i * 0.08}s both` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    {s.priority === "high" && <span style={{ color: "#EF4444", fontSize: 10, marginTop: 3 }}>\u25CF</span>}
                    <div>
                      <div style={{ fontSize: 13, color: "#c8cde0", lineHeight: 1.45 }}>{s.signal}</div>
                      <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, color: "#c9a962", backgroundColor: "#c9a96215", padding: "2px 8px", borderRadius: 3, fontWeight: 500 }}>{s.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Ops + Schedule */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: isMobile ? 12 : 20, marginTop: isMobile ? 12 : 20 }}>
              <div style={cardStyle()}>
                {sectionLabel("\u25C9", "AI Operations")}
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#f0ece4", marginBottom: 4 }}>${(usage.today || 0).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "#4a5170", marginBottom: 14 }}>Today</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 10, color: "#6b7394" }}>Tokens</div><div style={{ fontSize: 13, fontWeight: 500, color: "#c8cde0" }}>{((usage.tokensToday || 0) / 1000).toFixed(0)}K</div></div>
                  <div><div style={{ fontSize: 10, color: "#6b7394" }}>Month</div><div style={{ fontSize: 13, fontWeight: 500, color: "#c8cde0" }}>${(usage.month || 0).toFixed(2)}</div></div>
                </div>
              </div>
              <div style={cardStyle()}>
                {sectionLabel("\u25C6", "Schedule")}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { time: "9 AM", name: "Research Briefing", freq: "Weekdays", color: "#c9a962" },
                    { time: "12 PM", name: "Midday Ops", freq: "Daily", color: "#6b7394" },
                    { time: "8 AM Mon", name: "Financial Brief", freq: "Weekly", color: "#34D399" },
                    { time: "3 PM Fri", name: "Compliance", freq: "Weekly", color: "#F472B6" },
                    { time: "4 PM Fri", name: "Intel Brief", freq: "Weekly", color: "#818CF8" },
                    { time: "11 PM", name: "MC Deploy", freq: "Nightly", color: "#FBBF24" },
                  ].map((e, i) => (
                    <div key={i} style={{ padding: isMobile ? "10px 12px" : "12px", backgroundColor: "#0e1119", borderRadius: 8, borderLeft: `3px solid ${e.color}` }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: e.color }}>{e.time}</div>
                      <div style={{ fontSize: 12, color: "#c8cde0", marginTop: 3 }}>{e.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team */}
            <div style={{ ...cardStyle(), marginTop: isMobile ? 12 : 20 }}>
              {sectionLabel("\u25CE", "Team")}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: isMobile ? 8 : 12 }}>
                {team.map((m, i) => (
                  <div key={i} style={{ textAlign: "center" as const, padding: isMobile ? "10px 4px" : "14px 8px", backgroundColor: "#0e1119", borderRadius: 10, border: "1px solid #1a1f2e" }}>
                    <div style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: "50%", background: m.name === "Helix" ? "linear-gradient(135deg, #c9a962, #8b7340)" : "#1a1f30", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: m.name === "Helix" ? "#0a0d14" : "#6b7394" }}>{m.name[0]}</div>
                    <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: "#c8cde0" }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: "#4a5170", marginTop: 1 }}>{m.role}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 4 }}>
                      <StatusDot status={m.status} size={6} /><span style={{ fontSize: 10, color: "#6b7394" }}>{m.tasks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "inventory" && (
          <div style={cardStyle()}>
            {sectionLabel("\uD83D\uDCE6", "Inventory \u2014 Elixser Peptides", inventoryData?.lastUpdated ? `WooCommerce \u00B7 ${formatLastUpdated(inventoryData.lastUpdated)}` : undefined)}
            <div style={{ fontSize: 11, color: "#6b7394", marginBottom: 16 }}>
              {inventoryData?.source || "WooCommerce API"} \u00B7 {inventory.filter(i => i.status === "critical").length} critical \u00B7 {inventory.filter(i => i.status === "warning").length} warning \u00B7 {invSummary?.totalUnits?.toLocaleString() || 0} total units
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {inventory.map((item, i) => {
                const statusColors: Record<string, string> = { critical: "#EF4444", warning: "#FBBF24", ok: "#94A3B8", healthy: "#34D399" };
                const bgColors: Record<string, string> = { critical: "#EF444415", warning: "#FBBF2410", ok: "transparent", healthy: "transparent" };
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: isMobile ? "10px 12px" : "10px 16px",
                    borderRadius: 8,
                    backgroundColor: bgColors[item.status] || "transparent",
                    border: item.status === "critical" ? "1px solid #EF444430" : "1px solid #1e233320",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <StatusDot status={item.status === "critical" ? "critical" : item.status === "warning" ? "warning" : "healthy"} size={8} />
                      <span style={{ fontSize: isMobile ? 12 : 13, color: item.status === "critical" ? "#EF4444" : "#e0dcd4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                      {item.price && <span style={{ fontSize: 10, color: "#4a5170" }}>${item.price}</span>}
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusColors[item.status], minWidth: 50, textAlign: "right" as const }}>{item.stock} units</span>
                      {item.status === "critical" && <span style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>OUT</span>}
                      {item.status === "warning" && <span style={{ fontSize: 10, color: "#FBBF24", fontWeight: 600 }}>{item.daysSupply}d</span>}
                      {(item.status === "ok" || item.status === "healthy") && item.daysSupply > 0 && <span style={{ fontSize: 10, color: "#6b7394" }}>{item.daysSupply}d</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div style={cardStyle()}>
            {sectionLabel("\u25A3", `All Tasks (${tasks.length || 0})`)}
            {["In Progress", "To Do", "Paused", "Done"].map(status => {
              const filtered = (tasks.length > 0 ? tasks : []).filter((t: any) => t.status === status);
              if (filtered.length === 0) return null;
              const statusColor: Record<string, string> = { "Done": "#34D399", "In Progress": "#FBBF24", "To Do": "#6b7394", "Paused": "#EF4444" };
              return (
                <div key={status} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: statusColor[status], textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusDot status={status === "Done" ? "healthy" : status === "In Progress" ? "warning" : status === "Paused" ? "critical" : "neutral"} size={6} />
                    {status} ({filtered.length})
                  </div>
                  {filtered.map((task: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #141825" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 12 : 13, color: status === "Done" ? "#4a5170" : status === "Paused" ? "#6b7394" : "#c8cde0", textDecoration: status === "Done" ? "line-through" : "none", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                        {task.priority === "critical" && <span style={{ fontSize: 9, color: "#EF4444", fontWeight: 700, backgroundColor: "#EF444415", padding: "1px 5px", borderRadius: 3 }}>P0</span>}
                        <span style={{ fontSize: 10, color: "#4a5170", backgroundColor: "#161b28", padding: "2px 6px", borderRadius: 3 }}>{task.assignee}</span>
                        {task.dueDate && <span style={{ fontSize: 10, color: "#4a5170" }}>{task.dueDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "signals" && (
          <div style={cardStyle()}>
            {sectionLabel("\u26A1", "Research Signals")}
            {displaySignals.map((s, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < displaySignals.length - 1 ? "1px solid #1a1f2e" : "none", animation: `fadeIn 0.4s ease ${i * 0.06}s both` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: s.priority === "high" ? "#EF4444" : s.priority === "medium" ? "#FBBF24" : "#6b7394", fontSize: 10, marginTop: 4 }}>\u25CF</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#c8cde0", lineHeight: 1.5 }}>{s.signal}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: "#c9a962", backgroundColor: "#c9a96215", padding: "2px 8px", borderRadius: 3 }}>{s.source}</span>
                      <span style={{ fontSize: 10, color: s.priority === "high" ? "#EF4444" : "#6b7394", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{s.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "team" && (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24 }}>
            {[
              { label: "AI Team", color: "#c9a962", members: aiTeamBase },
              { label: "Human Team", color: "#38BDF8", members: humanTeam },
            ].map((section) => (
              <div key={section.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isMobile ? 12 : 16, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: section.color }}>
                  <span style={{ fontSize: 14 }}>\u25CE</span>
                  {section.label}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 12 : 20 }}>
                  {section.members.map((m, i) => {
                    const memberTasks = getActiveTasksForMember(m.name);
                    const avatarBackground = m.name === "Helix"
                      ? "linear-gradient(135deg, #c9a962, #8b7340)"
                      : m.type === "human"
                        ? "#1a2535"
                        : "#1a1f30";
                    const avatarColor = m.name === "Helix" ? "#0a0d14" : m.type === "human" ? "#38BDF8" : "#6b7394";
                    return (
                      <div key={`${section.label}-${i}`} style={cardStyle()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: avatarBackground, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: avatarColor }}>{m.name[0]}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#f0ece4" }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: "#6b7394" }}>{m.role}</div>
                          </div>
                          <StatusDot status={m.status} />
                        </div>
                        <div style={{ fontSize: 11, color: "#4a5170", marginBottom: 10 }}>{memberTasks.length} active \u00B7 {m.status === "warning" ? "At capacity" : "Available"}</div>
                        {memberTasks.map((t: any, j: number) => (
                          <div key={j} style={{ fontSize: 12, color: "#c8cde0", padding: "7px 0", borderTop: "1px solid #141825", display: "flex", alignItems: "center", gap: 6 }}>
                            <StatusDot status={t.status === "In Progress" ? "warning" : "neutral"} size={6} />
                            <span style={{ whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{t.title.length > 40 ? t.title.slice(0, 40) + "\u2026" : t.title}</span>
                          </div>
                        ))}
                        {memberTasks.length === 0 && (
                          <div style={{ fontSize: 12, color: "#3a3f52", fontStyle: "italic", paddingTop: 7 }}>No active tasks</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "crons" && (
          <div style={cardStyle()}>
            {sectionLabel("\u23F1", "Cron Job Health")}
            <div style={{ fontSize: 11, color: "#6b7394", marginBottom: 16 }}>
              {cronJobs.filter(j => j.health === "green").length} healthy \u00B7 {cronJobs.filter(j => j.health === "red").length} failing \u00B7 {cronJobs.filter(j => j.health === "yellow").length} idle
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cronJobs.map((job, i) => {
                const healthColors: Record<string, string> = { green: "#34D399", red: "#EF4444", yellow: "#FBBF24" };
                const healthLabels: Record<string, string> = { green: "OK", red: "FAIL", yellow: "IDLE" };
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: isMobile ? "10px 12px" : "12px 16px",
                    borderRadius: 8,
                    backgroundColor: job.health === "red" ? "#EF444410" : "transparent",
                    border: job.health === "red" ? "1px solid #EF444425" : "1px solid #1e233320",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <StatusDot status={job.health === "green" ? "healthy" : job.health === "red" ? "critical" : "warning"} size={8} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 12 : 13, color: "#e0dcd4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.name}</div>
                        <div style={{ fontSize: 10, color: "#4a5170" }}>{job.schedule}</div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      {job.lastDuration > 0 && <span style={{ fontSize: 10, color: "#4a5170" }}>{Math.round(job.lastDuration / 1000)}s</span>}
                      <span style={{ fontSize: 10, fontWeight: 700, color: healthColors[job.health], letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{healthLabels[job.health]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", backgroundColor: "#0a0d14", borderTop: "1px solid #1a1f2e", padding: "8px 0 env(safe-area-inset-bottom, 8px)", zIndex: 100 }}>
          {tabConfig.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "6px 16px", color: activeTab === tab.id ? "#c9a962" : "#4a5170", transition: "color 0.2s ease" }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: activeTab === tab.id ? 600 : 400, letterSpacing: "0.04em" }}>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}

      {!isMobile && (
        <footer style={{ padding: "16px 40px", borderTop: "1px solid #141825", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a3f52" }}>
          <span>Mission Control v3.0 \u00B7 Live WooCommerce Data</span>
          <span>Auto-deploy active \u00B7 {time.toLocaleDateString()}</span>
        </footer>
      )}
    </div>
  );
}
