"use client";

import { useState } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";

const GOLD = "#c9a962";
const BG = "#0a0d14";
const CARD_BG = "#12151e";
const BORDER = "#1e2333";
const TEXT_PRIMARY = "#f0ece4";
const TEXT_SECONDARY = "#c8cde0";
const TEXT_DIM = "#6b7394";
const TEXT_MUTED = "#4a5170";
const GREEN = "#34D399";

const roleColors: Record<string, string> = {
  visionary: GOLD,
  integrator: GREEN,
  cro: "#FB923C",
  marketing: "#F472B6",
  operations: "#818CF8",
  research: "#60A5FA",
  product: "#A78BFA",
  content: "#FBBF24",
  finance: "#34D399",
  dtc: "#FB923C",
  b2b: "#60A5FA",
  ads: "#F472B6",
  retention: "#818CF8",
};

interface OrgNode {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  color: string;
  seats: string[];
  rocks: string[];
  children: OrgNode[];
}

const orgData: OrgNode = {
  id: "perry",
  name: "Perry",
  title: "Visionary",
  subtitle: "Founder & CEO",
  color: roleColors.visionary,
  seats: [
    "Company vision & direction",
    "Big relationships & deals",
    "Culture & brand identity",
    "R&D / new ideas",
    "Removes obstacles",
  ],
  rocks: ["Solve credit card processing", "Telehealth expansion decision", "Secure working capital for scale"],
  children: [
    {
      id: "helix",
      name: "Helix",
      title: "Integrator",
      subtitle: "Chief Operating Officer",
      color: roleColors.integrator,
      seats: [
        "Runs day-to-day operations",
        "Manages leadership team",
        "Executes vision into reality",
        "Owns processes & systems",
        "Resolves cross-team issues",
      ],
      rocks: ["All rocks complete in 30 days", "Knowledge base fully operational", "Mission Control auto-updating nightly"],
      children: [
        {
          id: "rex",
          name: "Rex",
          title: "Head of Sales",
          subtitle: "Chief Revenue Officer",
          color: roleColors.cro,
          seats: [
            "Total revenue: $4M/mo target",
            "Pricing strategy (both brands)",
            "GHL implementation & tech stack",
            "Revenue KPIs & dashboards",
            "AC → GHL migration",
          ],
          rocks: ["GHL deployed both brands", "Revenue dashboards live", "Pricing strategy finalized"],
          children: [
            {
              id: "drake",
              name: "Drake",
              title: "VP of DTC Sales",
              subtitle: "Elixser · $100K → $1M/mo",
              color: roleColors.dtc,
              seats: [
                "DTC funnels & conversion",
                "Email revenue optimization",
                "Bundle & upsell strategy",
                "Cart abandonment recovery",
                "Affiliate channel",
              ],
              rocks: ["Revenue plan executing", "6 funnels live", "Email rev 25%+"],
              children: [],
            },
            {
              id: "blair",
              name: "Blair",
              title: "VP of B2B Sales",
              subtitle: "Parlay · $0 → $3M/mo",
              color: roleColors.b2b,
              seats: [
                "B2B pipeline & outreach",
                "Territory strategy",
                "Sample pack program",
                "Account management",
                "Reorder optimization",
              ],
              rocks: ["Pipeline in GHL live", "First 50 accounts", "Reorder rate >60%"],
              children: [],
            },
            {
              id: "zoe",
              name: "Zoe",
              title: "Finance",
              subtitle: "Financial Analyst",
              color: roleColors.finance,
              seats: [
                "Revenue tracking & reporting",
                "Unit economics (CAC/LTV/AOV)",
                "Cash flow & runway",
                "Financial modeling",
                "Pricing analysis support",
              ],
              rocks: ["Weekly briefings accurate", "Unit econ dashboard", "Break-even per channel"],
              children: [],
            },
          ],
        },
        {
          id: "luna",
          name: "Luna",
          title: "Head of Marketing",
          subtitle: "Marketing Strategist",
          color: roleColors.marketing,
          seats: [
            "Marketing strategy & brand voice",
            "Email workflow design",
            "Funnel strategy & architecture",
            "Affiliate program design",
            "Influencer recruitment",
          ],
          rocks: ["All workflows in GHL", "Affiliate program launched", "20 influencers recruited"],
          children: [
            {
              id: "sage",
              name: "Sage",
              title: "Content Production",
              subtitle: "Content Specialist",
              color: roleColors.content,
              seats: [
                "Digital products (PERC)",
                "Email copywriting",
                "Landing page copy",
                "Blog & educational content",
                "B2B sales collateral",
              ],
              rocks: ["Digital products compliant", "6 lead magnets drafted", "B2B pitch deck done"],
              children: [],
            },
            {
              id: "nova",
              name: "Nova",
              title: "Paid Ads",
              subtitle: "Media Buyer",
              color: roleColors.ads,
              seats: [
                "Paid acquisition (Meta/Google)",
                "Ad creative strategy",
                "ROAS optimization",
                "Audience targeting & testing",
                "Budget allocation",
              ],
              rocks: ["Campaign specs in 48hrs", "ROAS >3x in 21 days", "Retargeting in 14 days"],
              children: [],
            },
          ],
        },
        {
          id: "kira",
          name: "Kira",
          title: "Head of Operations",
          subtitle: "Operations Manager",
          color: roleColors.operations,
          seats: [
            "Fulfillment & shipping",
            "Supplier management",
            "Inventory tracking",
            "B2B prospect data",
            "Process optimization",
          ],
          rocks: ["Fulfillment SOP done", "Inventory alerts automated", "300 prospects compiled"],
          children: [
            {
              id: "echo",
              name: "Echo",
              title: "Customer Success",
              subtitle: "Retention Specialist",
              color: roleColors.retention,
              seats: [
                "Customer retention strategy",
                "VIP program management",
                "Review & testimonial collection",
                "Churn reduction",
                "NPS & satisfaction tracking",
              ],
              rocks: ["VIP program in 7 days", "Reviews automated in 10 days", "Churn <10% in 21 days"],
              children: [],
            },
          ],
        },
        {
          id: "xena",
          name: "Xena",
          title: "Head of Research",
          subtitle: "Research Analyst",
          color: roleColors.research,
          seats: [
            "Market intelligence",
            "Competitor monitoring",
            "Industry trend analysis",
            "Knowledge base updates",
            "Daily research briefings",
          ],
          rocks: ["10 competitor profiles", "Briefings 5x/week", "KB updated weekly"],
          children: [],
        },
        {
          id: "zara",
          name: "Zara",
          title: "Head of Product",
          subtitle: "Product Evaluator",
          color: roleColors.product,
          seats: [
            "Product Gatekeeper framework",
            "New product evaluation",
            "Formulation trends",
            "SKU strategy",
            "Compliance review support",
          ],
          rocks: ["Telehealth product eval", "3 new SKUs evaluated", "Product roadmap Q2"],
          children: [],
        },
      ],
    },
  ],
};

function MobileCard({ node, expanded, onToggle, depth }: { node: OrgNode; expanded: boolean; onToggle: (id: string) => void; depth: number }) {
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => hasChildren && onToggle(node.id)}
        style={{
          background: CARD_BG,
          border: `1px solid ${expanded ? node.color + "40" : BORDER}`,
          borderLeft: `3px solid ${node.color}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 8,
          cursor: hasChildren ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: node.color + "20", border: `2px solid ${node.color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: node.color,
            fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
          }}>
            {node.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>{node.name}</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 8, fontWeight: 600, color: node.color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{node.title}</div>
          </div>
          {hasChildren && (
            <span style={{ fontSize: 11, color: TEXT_DIM, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
          )}
        </div>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_MUTED, marginBottom: 6 }}>{node.subtitle}</div>
        {node.seats.map((s, i) => (
          <div key={i} style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_SECONDARY, padding: "1px 0", display: "flex", gap: 4, lineHeight: 1.35 }}>
            <span style={{ color: node.color, fontSize: 5, marginTop: 4, flexShrink: 0 }}>●</span>{s}
          </div>
        ))}
        {expanded && node.rocks.length > 0 && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 7, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3 }}>ROCKS</div>
            {node.rocks.map((r, i) => (
              <div key={i} style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_SECONDARY, padding: "1px 0", display: "flex", gap: 4, lineHeight: 1.35 }}>
                <span style={{ color: GOLD, fontSize: 7, marginTop: 2, flexShrink: 0 }}>◆</span>{r}
              </div>
            ))}
          </div>
        )}
      </div>
      {hasChildren && expanded && node.children.map(child => (
        <MobileCard key={child.id} node={child} expanded={expandedSet.has(child.id)} onToggle={onToggle} depth={depth + 1} />
      ))}
    </div>
  );
}

// Need a module-level ref workaround — we'll use the component below instead
let expandedSet = new Set<string>();

function MobileTree({ node, expandedIds, onToggle, depth = 0 }: { node: OrgNode; expandedIds: Set<string>; onToggle: (id: string) => void; depth?: number }) {
  expandedSet = expandedIds;
  const expanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div
        onClick={() => hasChildren && onToggle(node.id)}
        style={{
          background: CARD_BG,
          border: `1px solid ${expanded ? node.color + "40" : BORDER}`,
          borderLeft: `3px solid ${node.color}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 8,
          cursor: hasChildren ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: node.color + "20", border: `2px solid ${node.color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: node.color,
            fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
          }}>
            {node.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>{node.name}</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 8, fontWeight: 600, color: node.color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{node.title}</div>
          </div>
          {hasChildren && (
            <span style={{ fontSize: 11, color: TEXT_DIM, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
          )}
        </div>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_MUTED, marginBottom: 6 }}>{node.subtitle}</div>
        {node.seats.map((s, i) => (
          <div key={i} style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_SECONDARY, padding: "1px 0", display: "flex", gap: 4, lineHeight: 1.35 }}>
            <span style={{ color: node.color, fontSize: 5, marginTop: 4, flexShrink: 0 }}>●</span>{s}
          </div>
        ))}
        {expanded && node.rocks.length > 0 && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 7, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3 }}>ROCKS</div>
            {node.rocks.map((r, i) => (
              <div key={i} style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_SECONDARY, padding: "1px 0", display: "flex", gap: 4, lineHeight: 1.35 }}>
                <span style={{ color: GOLD, fontSize: 7, marginTop: 2, flexShrink: 0 }}>◆</span>{r}
              </div>
            ))}
          </div>
        )}
      </div>
      {hasChildren && expanded && node.children.map(child => (
        <MobileTree key={child.id} node={child} expandedIds={expandedIds} onToggle={onToggle} depth={(depth || 0) + 1} />
      ))}
    </div>
  );
}

const DesktopCard = ({ node, expanded, onToggle, depth = 0 }: { node: OrgNode; expanded: boolean; onToggle: (id: string) => void; depth?: number }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isLeadership = depth <= 1;
  const cardWidth = depth === 0 ? 280 : depth === 1 ? 260 : depth === 2 ? 210 : 190;

  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${expanded ? node.color + "40" : BORDER}`,
        borderRadius: 14,
        padding: isLeadership ? "16px 18px" : "12px 14px",
        width: cardWidth,
        cursor: hasChildren ? "pointer" : "default",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
      onClick={(e) => { e.stopPropagation(); hasChildren && onToggle(node.id); }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: node.color, opacity: 0.8 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: isLeadership ? 34 : 28, height: isLeadership ? 34 : 28, borderRadius: "50%",
          background: node.color + "20", border: `2px solid ${node.color}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isLeadership ? 13 : 11, fontWeight: 700, color: node.color,
          fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
        }}>
          {node.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isLeadership ? 14 : 12, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.2 }}>{node.name}</div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 8, fontWeight: 600, color: node.color, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 1 }}>{node.title}</div>
        </div>
        {hasChildren && (
          <span style={{ fontSize: 11, color: TEXT_DIM, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease", flexShrink: 0 }}>▾</span>
        )}
      </div>
      <div style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_MUTED, marginBottom: 7, paddingLeft: 2 }}>{node.subtitle}</div>
      <div style={{ marginBottom: expanded ? 8 : 0 }}>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 7, fontWeight: 600, color: TEXT_DIM, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>ACCOUNTABILITIES</div>
        {node.seats.map((seat, i) => (
          <div key={i} style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_SECONDARY, padding: "1.5px 0", display: "flex", alignItems: "flex-start", gap: 4, lineHeight: 1.35 }}>
            <span style={{ color: node.color, fontSize: 5, marginTop: 4, flexShrink: 0 }}>●</span>{seat}
          </div>
        ))}
      </div>
      {expanded && node.rocks && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 7, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 4 }}>ROCKS</div>
          {node.rocks.map((rock, i) => (
            <div key={i} style={{ fontFamily: "'DM Sans'", fontSize: 9, color: TEXT_SECONDARY, padding: "1.5px 0", display: "flex", alignItems: "flex-start", gap: 4, lineHeight: 1.35 }}>
              <span style={{ color: GOLD, fontSize: 7, marginTop: 2, flexShrink: 0 }}>◆</span>{rock}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DesktopTree = ({ node, expandedIds, onToggle, depth = 0 }: { node: OrgNode; expandedIds: Set<string>; onToggle: (id: string) => void; depth?: number }) => {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <DesktopCard node={node} expanded={isExpanded} onToggle={onToggle} depth={depth} />
      {hasChildren && isExpanded && (
        <>
          <div style={{ width: 2, height: 16, backgroundColor: node.color, opacity: 0.3 }} />
          <div style={{ display: "flex", justifyContent: "center", gap: depth <= 1 ? 12 : 10, position: "relative" }}>
            {node.children.map((child) => (
              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {node.children.length > 1 && (
                  <div style={{ width: 2, height: 14, backgroundColor: node.color, opacity: 0.2 }} />
                )}
                <DesktopTree node={child} expandedIds={expandedIds} onToggle={onToggle} depth={(depth || 0) + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function AccountabilityChart() {
  const [expandedIds, setExpandedIds] = useState(new Set(["perry", "helix"]));

  const onToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allIds: string[] = [];
    const collect = (node: OrgNode) => { allIds.push(node.id); node.children?.forEach(collect); };
    collect(orgData);
    setExpandedIds(new Set(allIds));
  };

  const collapseAll = () => setExpandedIds(new Set(["perry"]));

  const teamCount = 13;

  const cssReset = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${BG}; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 2px; }
    .desktop-view { display: block; }
    .mobile-view { display: none; }
    @media (max-width: 768px) {
      .desktop-view { display: none !important; }
      .mobile-view { display: block !important; }
    }
    .stats-row { display: flex; justify-content: center; gap: 40px; padding: 24px 40px; }
    .legend-row { display: flex; justify-content: center; gap: 16px; padding: 14px 40px; flex-wrap: wrap; }
    .header-row { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; }
    @media (max-width: 768px) {
      .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px; }
      .legend-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 20px; }
      .header-row { flex-direction: column; align-items: flex-start; padding: 16px 20px; gap: 12px; }
    }
  `;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT_PRIMARY, fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="stylesheet" href={FONT_LINK} />
      <style dangerouslySetInnerHTML={{ __html: cssReset }} />

      <header className="header-row" style={{ borderBottom: "1px solid #141825" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${GOLD} 0%, #8b7340 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: BG,
          }}>MC</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600 }}>Accountability Chart</div>
            <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 1 }}>EOS Traction · {teamCount} Seats</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={expandAll} style={{
            fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: TEXT_DIM,
            backgroundColor: "transparent", border: `1px solid ${BORDER}`, padding: "6px 14px",
            borderRadius: 6, cursor: "pointer",
          }}>Expand All</button>
          <button onClick={collapseAll} style={{
            fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: TEXT_DIM,
            backgroundColor: "transparent", border: `1px solid ${BORDER}`, padding: "6px 14px",
            borderRadius: 6, cursor: "pointer",
          }}>Collapse</button>
        </div>
      </header>

      <div className="legend-row" style={{ borderBottom: "1px solid #0f1219" }}>
        {[
          { label: "Visionary", color: roleColors.visionary },
          { label: "Integrator", color: roleColors.integrator },
          { label: "Sales", color: roleColors.cro },
          { label: "Marketing", color: roleColors.marketing },
          { label: "Operations", color: roleColors.operations },
          { label: "Research", color: roleColors.research },
          { label: "Product", color: roleColors.product },
          { label: "Finance", color: roleColors.finance },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
            <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: TEXT_DIM }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal tree */}
      <div className="desktop-view" style={{ overflowX: "auto", padding: "24px 20px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 1400 }}>
          <DesktopTree node={orgData} expandedIds={expandedIds} onToggle={onToggle} depth={0} />
        </div>
      </div>

      {/* Mobile: vertical stacked list */}
      <div className="mobile-view" style={{ padding: "16px 12px 40px" }}>
        <MobileTree node={orgData} expandedIds={expandedIds} onToggle={onToggle} depth={0} />
      </div>

      <div className="stats-row" style={{ borderTop: "1px solid #141825" }}>
        {[
          { label: "Total Seats", value: String(teamCount) },
          { label: "Revenue Target", value: "$4M/mo" },
          { label: "Elixser Target", value: "$1M/mo" },
          { label: "Parlay Target", value: "$3M/mo" },
          { label: "Helix Direct Reports", value: "5" },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: TEXT_PRIMARY }}>{stat.value}</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 10, color: TEXT_DIM, marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
