// App v2: consolidated wireframes — no variation tabs, one direction per screen.

// v2 sidebar — merged Payments & Receipts
const SideNavV2 = ({ active = "dashboard" }) => {
  const items = [
    ["dashboard", "Dashboard", "◐"],
    ["properties", "Properties", "▤"],
    ["rooms", "Rooms", "▦"],
    ["tenants", "Tenants", "♦"],
    ["charges", "Charge Catalog", "₱"],
    ["billing", "Billing Center", "▥"],
    ["payments", "Payments & Receipts", "✓"],
    ["reports", "Reports", "▣"],
  ];
  return (
    <aside className="app-side">
      <div className="brand"><span className="bee">●</span> BillBee</div>
      <nav>
        {items.map(([k, label, glyph]) => (
          <a key={k} href="#" className={k === active ? "active" : ""}>
            <span className="glyph">{glyph}</span> {label}
          </a>
        ))}
      </nav>
      <div className="side-section">— account —</div>
      <nav>
        <a href="#"><span className="glyph">⚙</span> Settings</a>
        <a href="#"><span className="glyph">↪</span> Sign out</a>
      </nav>
    </aside>
  );
};
window.SideNavV2 = SideNavV2;

const SCREENS_V2 = [
  { id: "overview", label: "🐝 Overview", phase: "intro" },

  { id: "dashboard", label: "Dashboard", phase: "Setup", Comp: () => <V2_Dashboard /> },
  { id: "properties", label: "Properties", phase: "Setup", Comp: () => <V2_Properties /> },
  { id: "property-hub", label: "↳ Property Hub", phase: "Setup", Comp: () => <V2_PropertyHub /> },
  { id: "charges", label: "Charges", phase: "Setup", Comp: () => <V2_Charges /> },
  { id: "rooms", label: "Rooms", phase: "Setup", Comp: () => <V2_Rooms /> },
  { id: "tenants", label: "Tenants", phase: "Setup", Comp: () => <V2_Tenants /> },
  { id: "tenant-detail", label: "↳ Tenant Detail", phase: "Setup", Comp: () => <V2_TenantDetail /> },

  { id: "billing", label: "Billing Cycles", phase: "Bill", Comp: () => <V2_BillingCycles /> },
  { id: "cycle-detail", label: "↳ Cycle Detail", phase: "Bill", Comp: () => <V2_CycleDetail /> },
  { id: "generate", label: "Generate Bills", phase: "Bill", Comp: () => <V2_GenerateBills /> },
  { id: "draft-bill", label: "Draft Bill", phase: "Bill", Comp: () => <V2_DraftBill /> },
  { id: "posted-bill", label: "Posted Bill + Bulk Email", phase: "Bill", Comp: () => <V2_PostedBill /> },

  { id: "payment-inline", label: "Record Payment (inline)", phase: "Collect", Comp: () => <V2_PaymentInline /> },
  { id: "payments-receipts", label: "Payments & Receipts (audit)", phase: "Collect", Comp: () => <V2_PaymentsReceipts /> },

  { id: "reports", label: "Reports", phase: "Insights", Comp: () => <V2_Reports /> },
  { id: "notifications", label: "Notifications", phase: "Insights", Comp: () => <V2_Notifications /> },
];

const OverviewV2 = ({ go }) => (
  <div className="screen">
    <div className="screen-head">
      <div>
        <h2 style={{ fontSize: 46 }}>BillBee — Landlord wireframes <span style={{ color: "var(--accent)" }}>v2</span></h2>
        <div className="blurb" style={{ fontSize: 16, maxWidth: 720 }}>
          Consolidated direction based on your picks. One screen per page — no more variation tabs.
          New: <b>Property Hub</b> (clicking a property card), <b>Tenant Detail</b>, <b>Cycle Detail</b>, merged <b>Payments &amp; Receipts</b>, and a <b>room-level charges picker</b> on the Room form.
        </div>
      </div>
      <div className="col" style={{ alignItems: "flex-end" }}>
        <Tag kind="accent">17 screens · one direction each</Tag>
        <span className="muted mono" style={{ fontSize: 11 }}>workflow phases: Setup · Bill · Collect · Insights</span>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <b className="marker" style={{ fontSize: 24 }}>Flow at a glance</b>
        <div className="muted mb-12" style={{ fontSize: 13.5 }}>Click any screen to jump in. Arrows show the natural path.</div>

        {[
          { phase: "Setup", screens: ["dashboard", "properties", "property-hub", "charges", "rooms", "tenants", "tenant-detail"] },
          { phase: "Bill",  screens: ["billing", "cycle-detail", "generate", "draft-bill", "posted-bill"] },
          { phase: "Collect", screens: ["payment-inline", "payments-receipts"] },
          { phase: "Insights", screens: ["reports", "notifications"] },
        ].map((group, gi) => (
          <div key={group.phase} className="mb-12">
            <div className="marker" style={{ fontSize: 18, color: "var(--accent)", marginBottom: 4 }}>{gi + 1}. {group.phase}</div>
            <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
              {group.screens.map((sid, i) => {
                const s = SCREENS_V2.find(x => x.id === sid);
                return (
                  <React.Fragment key={sid}>
                    <button className="sk-btn" onClick={() => go(SCREENS_V2.indexOf(s))} style={{ fontSize: 13 }}>
                      {s.label.replace(/^↳ /, "")}
                    </button>
                    {i < group.screens.length - 1 && <span className="mono soft">→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <div className="col">
        <Card style={{ padding: 16 }}>
          <b className="marker" style={{ fontSize: 22 }}>What changed from v1</b>
          <ul style={{ margin: "8px 0 0 18px", fontSize: 13.5, lineHeight: 1.6 }}>
            <li>One direction per screen — no variation tabs.</li>
            <li><b>Property Hub</b>: clicking a property card opens a page with sub-tabs (Overview · Charges · Rooms · Tenants · Bills).</li>
            <li><b>Tenant Detail</b> at <span className="mono">/tenants/:id</span> uses the master-detail layout.</li>
            <li><b>Cycle Detail</b>: each property-month cycle has its own page.</li>
            <li><b>Payments &amp; Receipts</b> merged — one audit table, click row for both payment + receipt.</li>
            <li><b>Room form</b> includes a charges-attached picker (room-level &amp; room-fixed scope).</li>
            <li>Bill computation trail annotates each line as <span className="mono">from room</span> / <span className="mono">from tenant</span>.</li>
            <li>Dashboard: 8 stat cards + collections chart (2/3) + quick actions (1/3). No recent-activity feed.</li>
          </ul>
        </Card>

        <Box hl>
          <b>Workflow guardrails wired in:</b>
          <ul style={{ margin: "4px 0 0 18px", fontSize: 13, lineHeight: 1.55 }}>
            <li>Property "ready to bill" pill when charges + rooms + active tenants exist</li>
            <li>Empty-state chain on Property Hub Overview</li>
            <li>Inline payment recording on bills · Payments page is audit/export only</li>
            <li>Bulk email skips Paid / Void / Pending; surfaces no-email tenants</li>
            <li>Imported CSV lines stay 🔒 — fix CSV + regen, or add an adjustment</li>
          </ul>
        </Box>
      </div>
    </div>
  </div>
);

const AppV2 = () => {
  const [active, setActive] = React.useState(0);
  const s = SCREENS_V2[active];

  // group tabs by phase for the topbar
  const phases = ["intro", "Setup", "Bill", "Collect", "Insights"];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <span>🐝 BillBee</span>
          <span className="sub">landlord wireframes · v2 · final direction</span>
        </div>
        <div className="topbar-tabs" style={{ rowGap: 6 }}>
          {phases.map((p) => {
            const screens = SCREENS_V2.filter(s => s.phase === p);
            if (!screens.length) return null;
            return (
              <div key={p} className="row" style={{ gap: 2, alignItems: "center" }}>
                {p !== "intro" && (
                  <span className="marker" style={{ fontSize: 13, color: "var(--ink-muted)", paddingLeft: 8, paddingRight: 4 }}>
                    {p.toLowerCase()} ·
                  </span>
                )}
                {screens.map((scr) => {
                  const i = SCREENS_V2.indexOf(scr);
                  return (
                    <button
                      key={scr.id}
                      className={`topbar-tab ${i === active ? "active" : ""}`}
                      onClick={() => setActive(i)}
                      style={{ fontSize: 13.5 }}
                    >
                      {scr.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {active === 0 ? <OverviewV2 go={setActive} /> : <s.Comp />}
    </>
  );
};

const rootV2 = ReactDOM.createRoot(document.getElementById("root"));
rootV2.render(<AppV2 />);
