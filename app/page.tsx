"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type Task = { title: string; status: string; assignee: string; due?: string };
type Signal = { signal: string; source: string; priority: string };
type RevenueBrand = {
  brand: string;
  status: string;
  daily: number | string;
  weekly: number | string;
  monthly: number | string;
  trend: Array<number | string>;
  source: string;
  notes?: string;
  customers?: number | string;
  orders?: number | string;
};
type InventoryItem = {
  sku: string;
  brand: string;
  stockUnits: number;
  daysSupply: number | string;
  alert: string;
};

type Funnel = { name: string; brand: string; conversionRate: string | number; aov: string | number; cac: string | number; status: string; source: string };
type CronJob = { name: string; status: string; color: string; frequency: string; source: string; feed: string };

type CustomerBrand = { brand: string; status: string; currentMonthCustomers: string | number; currentMonthOrders: string | number; history: Array<{ month: string; customers: number; orders: number }>; source: string };

type JsonMap = Record<string, unknown>;

const bg = "#07111f";
const panel = "rgba(10, 20, 36, 0.88)";
const panelSoft = "rgba(15, 27, 46, 0.72)";
const border = "rgba(148, 163, 184, 0.14)";
const text = "#e6eef8";
const muted = "#8da2bd";
const accent = "#60a5fa";
const accent2 = "#22c55e";
const accent3 = "#f59e0b";

const fmtCurrency = (value: string | number) => {
  if (typeof value === "string") return value;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const fmtNumber = (value: string | number) => (typeof value === "string" ? value : value.toLocaleString());

function StatusPill({ label, tone }: { label: string; tone: "green" | "yellow" | "red" | "blue" | "slate" }) {
  const map = {
    green: { bg: "rgba(34,197,94,.12)", color: "#86efac", border: "rgba(34,197,94,.24)" },
    yellow: { bg: "rgba(245,158,11,.12)", color: "#fcd34d", border: "rgba(245,158,11,.24)" },
    red: { bg: "rgba(239,68,68,.12)", color: "#fca5a5", border: "rgba(239,68,68,.24)" },
    blue: { bg: "rgba(96,165,250,.12)", color: "#93c5fd", border: "rgba(96,165,250,.24)" },
    slate: { bg: "rgba(148,163,184,.12)", color: "#cbd5e1", border: "rgba(148,163,184,.18)" },
  }[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: map.bg, color: map.color, border: `1px solid ${map.border}`, fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <section style={{ background: panel, backdropFilter: "blur(18px)", border: `1px solid ${border}`, borderRadius: 22, boxShadow: "0 16px 48px rgba(0,0,0,.22)", ...style }}>{children}</section>;
}

function Spark({ values, color = accent }: { values: Array<number | string>; color?: string }) {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (!nums.length) return <div style={{ color: muted, fontSize: 12 }}>No verified trend yet</div>;
  const w = 180; const h = 52;
  const min = Math.min(...nums); const max = Math.max(...nums); const range = max - min || 1;
  const pts = nums.map((v, i) => `${(i / Math.max(nums.length - 1, 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 52 }}><polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><polyline points={`0,${h} ${pts} ${w},${h}`} fill="rgba(96,165,250,.08)" /></svg>;
}

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [usage, setUsage] = useState({ today: 0, month: 0, tokensToday: 0 });
  const [revenue, setRevenue] = useState<{ brands: RevenueBrand[] }>({ brands: [] });
  const [inventory, setInventory] = useState<{ items: InventoryItem[] }>({ items: [] });
  const [funnels, setFunnels] = useState<{ funnels: Funnel[] }>({ funnels: [] });
  const [cash, setCash] = useState<JsonMap>({});
  const [cronHealth, setCronHealth] = useState<{ jobs: CronJob[] }>({ jobs: [] });
  const [customers, setCustomers] = useState<{ brands: CustomerBrand[] }>({ brands: [] });
  const [roas, setRoas] = useState<JsonMap>({});

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      const urls = [
        "/data/tasks.json", "/data/social.json", "/data/usage.json", "/data/revenue.json", "/data/inventory.json", "/data/funnels.json", "/data/cash.json", "/data/cron-health.json", "/data/customers.json", "/data/roas.json",
      ];
      const results = await Promise.all(urls.map((u) => fetch(u).then((r) => r.json()).catch(() => null)));
      const [tasksData, socialData, usageData, revenueData, inventoryData, funnelData, cashData, cronData, customerData, roasData] = results;
      if (tasksData) setTasks(tasksData);
      if (socialData?.topSignals) setSignals(socialData.topSignals);
      if (usageData) {
        const today = new Date().toISOString().slice(0, 10);
        const currentMonth = today.slice(0, 7);
        const dailyData = usageData.dailyUsage?.[today];
        setUsage({
          today: dailyData?.estimatedCost || 0,
          month: usageData.monthlyUsage?.[currentMonth]?.estimatedCost || 0,
          tokensToday: (dailyData?.totalInputTokens || 0) + (dailyData?.totalOutputTokens || 0),
        });
      }
      if (revenueData) setRevenue(revenueData);
      if (inventoryData) setInventory(inventoryData);
      if (funnelData) setFunnels(funnelData);
      if (cashData) setCash(cashData);
      if (cronData) setCronHealth(cronData);
      if (customerData) setCustomers(customerData);
      if (roasData) setRoas(roasData);
    };
    fetchAll();
  }, []);

  const taskStats = useMemo(() => ({
    done: tasks.filter((t) => t.status === "Done").length,
    active: tasks.filter((t) => t.status === "In Progress").length,
    queued: tasks.filter((t) => t.status === "To Do").length,
  }), [tasks]);

  const lowInventory = inventory.items.filter((i) => typeof i.daysSupply === "number" && i.daysSupply < 14).slice(0, 6);
  const elixserRevenue = revenue.brands.find((b) => b.brand === "Elixser");

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at top, rgba(96,165,250,.16), transparent 32%), radial-gradient(circle at right top, rgba(34,197,94,.09), transparent 26%), ${bg}`, color: text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 16px 40px" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: accent, textTransform: "uppercase", letterSpacing: ".16em", fontWeight: 700 }}>Mission Control</div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>Revenue, ops, risk — one screen</div>
                <div style={{ color: muted, marginTop: 8, fontSize: 14 }}>Premium mobile-first dashboard rebuilt around verified Elixser data and explicit placeholders everywhere else.</div>
              </div>
              <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                <StatusPill label="Accountability chart removed" tone="blue" />
                <div style={{ color: muted, fontSize: 13 }}>{time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <Card style={{ padding: 18 }}><div style={{ color: muted, fontSize: 12 }}>AI token cost today</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{fmtCurrency(usage.today)}</div><div style={{ color: muted, fontSize: 12, marginTop: 8 }}>{Math.round(usage.tokensToday / 1000).toLocaleString()}K tokens</div></Card>
            <Card style={{ padding: 18 }}><div style={{ color: muted, fontSize: 12 }}>AI month-to-date</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{fmtCurrency(usage.month)}</div><div style={{ color: accent2, fontSize: 12, marginTop: 8 }}>Auto-updates every 5 min</div></Card>
            <Card style={{ padding: 18 }}><div style={{ color: muted, fontSize: 12 }}>Task board</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{taskStats.active}</div><div style={{ color: muted, fontSize: 12, marginTop: 8 }}>{taskStats.done} done · {taskStats.queued} queued</div></Card>
            <Card style={{ padding: 18 }}><div style={{ color: muted, fontSize: 12 }}>Top signals</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{signals.length}</div><div style={{ color: accent3, fontSize: 12, marginTop: 8 }}>Nightly intelligence feed</div></Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: 16 }} className="desktopGrid">
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Revenue by brand</div>
                  <div style={{ color: muted, fontSize: 13, marginTop: 6 }}>Daily, weekly, monthly snapshot. Only Elixser is currently backed by verified revenue data.</div>
                </div>
                <StatusPill label="Real + placeholder split" tone="slate" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
                {revenue.brands.map((brand) => (
                  <div key={brand.brand} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 18, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{brand.brand}</div>
                      <StatusPill label={brand.status === "real" ? "Verified" : "Placeholder"} tone={brand.status === "real" ? "green" : "yellow"} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
                      <div><div style={{ color: muted, fontSize: 11 }}>Daily</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(brand.daily)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>Weekly</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(brand.weekly)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>Monthly</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(brand.monthly)}</div></div>
                    </div>
                    <div style={{ marginTop: 14 }}><Spark values={brand.trend} /></div>
                    <div style={{ color: muted, fontSize: 12, marginTop: 10 }}>{brand.notes || brand.source}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent2, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Cash position & burn</div>
              <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
                <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 18, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Cash position</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{fmtCurrency((cash.cashPosition as string | number) || "[PLACEHOLDER — needs current bank/cash source]")}</div></div>
                <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 18, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Monthly burn</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{fmtCurrency((cash.monthlyBurn as string | number) || "[PLACEHOLDER — needs current OPEX source]")}</div></div>
                <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 18, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Runway</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{String(cash.runway || "[PLACEHOLDER — needs current cash + burn]")}</div></div>
                <div style={{ color: muted, fontSize: 12 }}>No current live ledger was found. Historical cash references exist in financial analysis notes, but I kept live cash/burn as placeholder rather than showing stale numbers.</div>
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="desktopGrid">
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 13, color: accent3, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Inventory levels & reorder alerts</div>
                  <div style={{ color: muted, fontSize: 13, marginTop: 6 }}>Anything under 14 days supply is flagged.</div>
                </div>
                <StatusPill label={`${lowInventory.length} critical SKUs`} tone={lowInventory.length ? "red" : "green"} />
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {inventory.items.slice(0, 8).map((item) => (
                  <div key={item.sku} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{item.sku}</div>
                        <div style={{ color: muted, fontSize: 12, marginTop: 4 }}>{item.stockUnits} units on hand</div>
                      </div>
                      <StatusPill label={typeof item.daysSupply === "number" ? `${item.daysSupply} days` : "No velocity"} tone={item.alert === "critical" ? "red" : "green"} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Funnel metrics</div>
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {funnels.funnels.map((f) => (
                  <div key={f.name} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 15 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}><div style={{ fontWeight: 700 }}>{f.name}</div><StatusPill label={f.status === "placeholder" ? "Needs source" : f.status === "mixed" ? "Partial" : "Live"} tone={f.status === "placeholder" ? "yellow" : f.status === "mixed" ? "blue" : "green"} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
                      <div><div style={{ color: muted, fontSize: 11 }}>CVR</div><div style={{ fontWeight: 700, marginTop: 4 }}>{String(f.conversionRate)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>AOV</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(f.aov)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>CAC</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(f.cac)}</div></div>
                    </div>
                    <div style={{ color: muted, fontSize: 12, marginTop: 10 }}>{f.source}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="desktopGrid3">
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent2, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Customer count by brand</div>
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {customers.brands.map((b) => (
                  <div key={b.brand} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 15 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}><div style={{ fontWeight: 700 }}>{b.brand}</div><StatusPill label={b.status === "real" ? "Verified" : "Placeholder"} tone={b.status === "real" ? "green" : "yellow"} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                      <div><div style={{ color: muted, fontSize: 11 }}>Customers</div><div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{fmtNumber(b.currentMonthCustomers)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>Orders</div><div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{fmtNumber(b.currentMonthOrders)}</div></div>
                    </div>
                    <div style={{ color: muted, fontSize: 12, marginTop: 10 }}>{b.source}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent3, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Ad spend vs revenue (ROAS)</div>
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {((roas.brands as Array<JsonMap>) || []).map((b) => (
                  <div key={String(b.brand)} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 15 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}><div style={{ fontWeight: 700 }}>{String(b.brand)}</div><StatusPill label={String(b.status) === "placeholder" ? "Waiting on ads" : "Partial"} tone={String(b.status) === "placeholder" ? "yellow" : "blue"} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                      <div><div style={{ color: muted, fontSize: 11 }}>Ad spend</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(b.adSpend as string | number)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>Revenue</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fmtCurrency(b.revenue as string | number)}</div></div>
                      <div><div style={{ color: muted, fontSize: 11 }}>ROAS</div><div style={{ fontWeight: 700, marginTop: 4 }}>{String(b.roas)}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Cron job health status</div>
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {cronHealth.jobs.map((job) => (
                  <div key={job.name} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{job.name}</div>
                        <div style={{ color: muted, fontSize: 12, marginTop: 4 }}>{job.frequency}</div>
                      </div>
                      <StatusPill label={job.status} tone={job.color === "green" ? "green" : job.color === "yellow" ? "yellow" : "red"} />
                    </div>
                    <div style={{ color: muted, fontSize: 12, marginTop: 8 }}>{job.feed}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 16 }} className="desktopGrid">
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent3, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Team task board</div>
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {tasks.slice(0, 8).map((task, index) => (
                  <div key={`${task.title}-${index}`} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{task.title}</div><div style={{ color: muted, fontSize: 12, marginTop: 4 }}>{task.assignee}{task.due ? ` · ${task.due}` : ""}</div></div>
                    <StatusPill label={task.status} tone={task.status === "Done" ? "green" : task.status === "In Progress" ? "yellow" : "slate"} />
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Top signals / market intel</div>
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {signals.slice(0, 5).map((signal, index) => (
                  <div key={`${signal.signal}-${index}`} style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{signal.signal}</div><StatusPill label={signal.priority} tone={signal.priority === "high" ? "red" : signal.priority === "medium" ? "yellow" : "slate"} /></div>
                    <div style={{ color: muted, fontSize: 12, marginTop: 8 }}>{signal.source}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: accent2, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".14em" }}>Verified Elixser snapshot</div>
                <div style={{ color: muted, fontSize: 13, marginTop: 6 }}>Real values pulled from the Helix Financial Data sheet and local customer/inventory analysis files.</div>
              </div>
              {elixserRevenue && <StatusPill label={`${fmtCurrency(elixserRevenue.monthly)} current month tracked`} tone="green" />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
              <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Feb revenue</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{fmtCurrency(elixserRevenue?.monthly || 0)}</div></div>
              <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Avg daily revenue</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{fmtCurrency(elixserRevenue?.daily || 0)}</div></div>
              <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Feb customers</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{fmtNumber(elixserRevenue?.customers || 0)}</div></div>
              <div style={{ background: panelSoft, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}><div style={{ color: muted, fontSize: 11 }}>Feb orders</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{fmtNumber(elixserRevenue?.orders || 0)}</div></div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }
        @media (max-width: 980px) {
          .desktopGrid, .desktopGrid3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          body { overflow-x: hidden; }
        }
      `}</style>
    </div>
  );
}
