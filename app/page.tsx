"use client";

import { useState, useEffect } from "react";

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val}`;
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
    <div style={{ width: `${Math.max((value / max) * 100, 1)}%`, height: "100%", backgroundColor: color, borderRadius: height / 2, transition: "width 1s ease" }} />
  </div>
);

const SparkLine = ({ data, color = "#c9a962", height = 40, width = 120 }: { data: number[]; color?: string; height?: number; width?: number }) => {
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

interface Task { title: string; status: string; assignee: string; due: string; }
interface Signal { signal: string; source: string; priority: string; }
interface TeamMember { name: string; role: string; tasks: number; status: string; }

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
  const [financials, setFinancials] = useState({
    elixserRevenue: 100000, elixserTarget: 1000000,
    parlayRevenue: 0, parlayTarget: 3000000,
    cashPosition: 45000, runway: "4.5 mo",
    revenueHistory: [62000, 71000, 78000, 85000, 92000, 88000, 100000],
    aov: 150, cac: 25, ltv: 450,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, socialRes, memoryRes, usageRes] = await Promise.all([
          fetch('/data/tasks.json').catch(() => null),
          fetch('/data/social.json').catch(() => null),
          fetch('/data/memory.json').catch(() => null),
          fetch('/data/usage.json').catch(() => null),
        ]);
        if (tasksRes?.ok) { const d = await tasksRes.json(); setTasks(d); }
        if (socialRes?.ok) { const d = await socialRes.json(); setSignals(d.topSignals || []); }
        if (memoryRes?.ok) {
          const d = await memoryRes.json();
          if (d.team) setTeam(d.team.map((t: any) => ({ name: t.name, role: t.role, tasks: 0, status: "healthy" })));
        }
        if (usageRes?.ok) {
          const d = await usageRes.json();
          const today = new Date().toISOString().slice(0, 10);
          const currentMonth = today.slice(0, 7); // "2026-03"
          const dailyData = d.dailyUsage?.[today];
          const monthCost = d.monthlyUsage?.[currentMonth]?.estimatedCost || 0;
          if (dailyData) setUsage({ today: dailyData.estimatedCost || 0, month: monthCost, tokensToday: (dailyData.totalInputTokens || 0) + (dailyData.totalOutputTokens || 0) });
        }
      } catch (e) { console.error('Fetch error:', e); }
    };
    fetchAll();
  }, []);

  const completedTasks = tasks.filter((t: any) => t.status === "Done").length;
  const inProgress = tasks.filter((t: any) => t.status === "In Progress").length;
  const toDo = tasks.filter((t: any) => t.status === "To Do").length;

  const team: TeamMember[] = teamData.length > 0 ? teamData.map(m => ({
    ...m,
    tasks: tasks.filter((t: any) => t.assignee === m.name && t.status !== "Done").length,
    status: tasks.filter((t: any) => t.assignee === m.name && t.status !== "Done").length > 5 ? "warning" : "healthy",
  })) : [
    { name: "Helix", role: "COO", tasks: 0, status: "healthy" },
    { name: "Luna", role: "Marketing", tasks: 9, status: "warning" },
    { name: "Xena", role: "Research", tasks: 2, status: "healthy" },
    { name: "Zara", role: "Product", tasks: 2, status: "healthy" },
    { name: "Kira", role: "Operations", tasks: 1, status: "healthy" },
    { name: "Zoe", role: "Finance", tasks: 2, status: "healthy" },
  ];

  const displaySignals = signals.length > 0 ? signals : [
    { signal: "RFK Jr. removing 14 peptides from FDA ban list", source: "Regulatory", priority: "high" },
    { signal: "Growing demand for peptide dosing education", source: "r/Peptides", priority: "high" },
    { signal: "BPC-157 gummy market has limited competition", source: "Market Intel", priority: "medium" },
  ];

  const tabConfig = [
    { id: "home", icon: "◆", label: "Home" },
    { id: "tasks", icon: "▣", label: "Tasks" },
    { id: "signals", icon: "⚡", label: "Signals" },
    { id: "team", icon: "◎", label: "Team" },
    { id: "orgchart", icon: "◈", label: "Org Chart", href: "/accountability" },
  ];

  const cardStyle = (accent = false) => ({
    background: accent ? "linear-gradient(135deg, #1a1f2e 0%, #0f1219 100%)" : "linear-gradient(180deg, #12151e 0%, #0d1017 100%)",
    borderRadius: isMobile ? 14 : 16,
    border: accent ? "1px solid #c9a96230" : "1px solid #1e2333",
    padding: isMobile ? 18 : 28,
    marginBottom: isMobile ? 12 : 0,
  });

  const sectionLabel = (icon: string, text: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isMobile ? 14 : 20, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#c9a962" }}>
      <span style={{ fontSize: 14 }}>{icon}</span>{text}
    </div>
  );

  const metricBlock = (label: string, value: string, sub?: string, trend?: number) => (
    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
      <div style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: "#6b7394", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 600, color: "#f0ece4", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</span>
        {trend && <span style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, color: trend > 0 ? "#34D399" : "#EF4444" }}>{trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%</span>}
      </div>
      {sub && <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "#4a5170", marginTop: 3 }}>{sub}</div>}
    </div>
  );

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
            {!isMobile && <div style={{ fontSize: 11, color: "#4a5170", marginTop: 1 }}>Elixser Peptides · Parlay Wellness</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: isMobile ? 12 : 13, color: "#c8cde0", fontWeight: 500 }}>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
            {!isMobile && <div style={{ fontSize: 10, color: "#4a5170" }}>{time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "4px 8px" : "6px 12px", backgroundColor: "#34D39915", borderRadius: 6, border: "1px solid #34D39930" }}>
            <StatusDot status="healthy" size={6} />
            {!isMobile && <span style={{ fontSize: 11, color: "#34D399", fontWeight: 500 }}>All Systems</span>}
          </div>
        </div>
      </header>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 4, padding: "12px 40px", borderBottom: "1px solid #0f1219" }}>
          {tabConfig.map(tab => (
            tab.href ? (
              <a key={tab.id} href={tab.href} style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 400, color: "#6b7394", backgroundColor: "transparent", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s ease", textDecoration: "none", display: "block" }}>
                {tab.icon} {tab.label}
              </a>
            ) : (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? "#c9a962" : "#6b7394", backgroundColor: activeTab === tab.id ? "#c9a96210" : "transparent", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s ease" }}>
                {tab.icon} {tab.label}
              </button>
            )
          ))}
        </nav>
      )}

      <main style={{ padding: isMobile ? "16px 16px 24px" : "28px 40px", maxWidth: 1440, margin: "0 auto" }}>
        {activeTab === "home" && (
          <>
            <div style={cardStyle(true)}>
              {sectionLabel("◆", "Revenue")}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 20 : 40 }}>
                <div style={{ flex: 1 }}>
                  {metricBlock("Elixser Monthly", formatCurrency(financials.elixserRevenue), `Target: ${formatCurrency(financials.elixserTarget)}`, 8.5)}
                  <ProgressBar value={financials.elixserRevenue} max={financials.elixserTarget} />
                  <div style={{ fontSize: 11, color: "#4a5170", marginTop: 6 }}>{((financials.elixserRevenue / financials.elixserTarget) * 100).toFixed(0)}% to target</div>
                </div>
                <div style={{ flex: 1 }}>
                  {metricBlock("Parlay B2B Monthly", formatCurrency(financials.parlayRevenue || 0), `Target: ${formatCurrency(financials.parlayTarget)}`)}
                  <ProgressBar value={1} max={financials.parlayTarget} color="#6b7394" />
                  <div style={{ fontSize: 11, color: "#4a5170", marginTop: 6 }}>Pre-launch · Sample packs in 2 weeks</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: isMobile ? 10 : 20, marginTop: isMobile ? 12 : 20 }}>
              {[
                { label: "CAC", value: `$${financials.cac}`, color: "#f0ece4" },
                { label: "AOV", value: `$${financials.aov}`, color: "#f0ece4" },
                { label: "LTV:CAC", value: "18:1", color: "#34D399" },
                { label: "Cash", value: formatCurrency(financials.cashPosition), color: "#c9a962" },
              ].map((m, i) => (
                <div key={i} style={{ ...cardStyle(), padding: isMobile ? 14 : 20, textAlign: "center" as const }}>
                  <div style={{ fontSize: 10, color: "#6b7394", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{m.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 22 : 28, fontWeight: 600, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 20, marginTop: isMobile ? 12 : 20 }}>
              <div style={cardStyle()}>
                {sectionLabel("◈", "Revenue Trend")}
                <SparkLine data={financials.revenueHistory} height={50} width={200} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a5170", marginTop: 8 }}>
                  <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
                  <span style={{ color: "#c9a962", fontWeight: 600 }}>Now</span>
                </div>
              </div>
              <div style={cardStyle()}>
                {sectionLabel("▣", "Sprint Progress")}
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 16 : 24, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 36 : 44, fontWeight: 600, color: "#f0ece4", lineHeight: 1 }}>{completedTasks}</span>
                    <span style={{ fontSize: 18, color: "#4a5170" }}>/{tasks.length || 17}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={completedTasks || 7} max={tasks.length || 17} color="#34D399" height={6} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#34D399" }}>{completedTasks || 7} done</span>
                      <span style={{ fontSize: 11, color: "#FBBF24" }}>{inProgress || 6} active</span>
                      <span style={{ fontSize: 11, color: "#6b7394" }}>{toDo || 4} queued</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle(), marginTop: isMobile ? 12 : 20 }}>
              {sectionLabel("⚡", "Top Signals")}
              {displaySignals.slice(0, 3).map((s, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? "1px solid #1a1f2e" : "none", animation: `fadeIn 0.4s ease ${i * 0.08}s both` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    {s.priority === "high" && <span style={{ color: "#EF4444", fontSize: 10, marginTop: 3 }}>●</span>}
                    <div>
                      <div style={{ fontSize: 13, color: "#c8cde0", lineHeight: 1.45 }}>{s.signal}</div>
                      <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, color: "#c9a962", backgroundColor: "#c9a96215", padding: "2px 8px", borderRadius: 3, fontWeight: 500 }}>{s.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: isMobile ? 12 : 20, marginTop: isMobile ? 12 : 20 }}>
              <div style={cardStyle()}>
                {sectionLabel("◉", "AI Operations")}
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#f0ece4", marginBottom: 4 }}>${(usage.today || 9.92).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "#4a5170", marginBottom: 14 }}>Today · Sonnet 4.5</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 10, color: "#6b7394" }}>Tokens</div><div style={{ fontSize: 13, fontWeight: 500, color: "#c8cde0" }}>{((usage.tokensToday || 1660000) / 1000).toFixed(0)}K</div></div>
                  <div><div style={{ fontSize: 10, color: "#6b7394" }}>Month</div><div style={{ fontSize: 13, fontWeight: 500, color: "#c8cde0" }}>${(usage.month || 9.92).toFixed(2)}</div></div>
                </div>
              </div>
              <div style={cardStyle()}>
                {sectionLabel("◆", "Schedule")}
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

            <div style={{ ...cardStyle(), marginTop: isMobile ? 12 : 20 }}>
              {sectionLabel("◎", "Team")}
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

        {activeTab === "tasks" && (
          <div style={cardStyle()}>
            {sectionLabel("▣", `All Tasks (${tasks.length || 17})`)}
            {["In Progress", "To Do", "Done"].map(status => {
              const filtered = (tasks.length > 0 ? tasks : []).filter((t: any) => t.status === status);
              if (filtered.length === 0) return null;
              const statusColor: Record<string, string> = { "Done": "#34D399", "In Progress": "#FBBF24", "To Do": "#6b7394" };
              return (
                <div key={status} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: statusColor[status], textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusDot status={status === "Done" ? "healthy" : status === "In Progress" ? "warning" : "neutral"} size={6} />
                    {status} ({filtered.length})
                  </div>
                  {filtered.map((task: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #141825" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 12 : 13, color: status === "Done" ? "#4a5170" : "#c8cde0", textDecoration: status === "Done" ? "line-through" : "none", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontSize: 10, color: "#4a5170", backgroundColor: "#161b28", padding: "2px 6px", borderRadius: 3 }}>{task.assignee}</span>
                        {task.due && <span style={{ fontSize: 10, color: "#4a5170" }}>{task.due}</span>}
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
            {sectionLabel("⚡", "Research Signals")}
            {displaySignals.map((s, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < displaySignals.length - 1 ? "1px solid #1a1f2e" : "none", animation: `fadeIn 0.4s ease ${i * 0.06}s both` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: s.priority === "high" ? "#EF4444" : s.priority === "medium" ? "#FBBF24" : "#6b7394", fontSize: 10, marginTop: 4 }}>●</span>
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
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 12 : 20 }}>
            {team.map((m, i) => (
              <div key={i} style={cardStyle()}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: m.name === "Helix" ? "linear-gradient(135deg, #c9a962, #8b7340)" : "#1a1f30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: m.name === "Helix" ? "#0a0d14" : "#6b7394" }}>{m.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#f0ece4" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7394" }}>{m.role}</div>
                  </div>
                  <StatusDot status={m.status} />
                </div>
                <div style={{ fontSize: 11, color: "#4a5170", marginBottom: 10 }}>{m.tasks} active · {m.status === "warning" ? "At capacity" : "Available"}</div>
                {tasks.filter((t: any) => t.assignee === m.name && t.status !== "Done").map((t: any, j: number) => (
                  <div key={j} style={{ fontSize: 12, color: "#c8cde0", padding: "7px 0", borderTop: "1px solid #141825", display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusDot status={t.status === "In Progress" ? "warning" : "neutral"} size={6} />
                    <span style={{ whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{t.title.length > 40 ? t.title.slice(0, 40) + "…" : t.title}</span>
                  </div>
                ))}
                {tasks.filter((t: any) => t.assignee === m.name && t.status !== "Done").length === 0 && (
                  <div style={{ fontSize: 12, color: "#3a3f52", fontStyle: "italic", paddingTop: 7 }}>No active tasks</div>
                )}
              </div>
            ))}
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
          <span>Mission Control v2.0 · Powered by Helix COO</span>
          <span>Auto-deploy active · {time.toLocaleDateString()}</span>
        </footer>
      )}
    </div>
  );
}
