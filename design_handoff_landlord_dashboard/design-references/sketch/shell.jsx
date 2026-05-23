// Shell: top tab bar (one per screen group), variation tab control, and frame chrome.

const Frame = ({ url, children, noFlex, style }) => (
  <div className="frame">
    <div className="frame-bar">
      <div className="frame-dots">
        <span className="frame-dot" />
        <span className="frame-dot" />
        <span className="frame-dot" />
      </div>
      <span className="frame-url">{url || "billbee.app/landlord"}</span>
    </div>
    <div className={`frame-body ${noFlex ? "no-flex" : ""}`} style={style}>
      {children}
    </div>
  </div>
);

// Standard landlord sidebar — used by sidebar-nav variations
const SideNav = ({ active = "dashboard" }) => {
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

// Compact icon-only rail (alternate nav)
const RailNav = ({ active = "dashboard" }) => {
  const items = [
    ["dashboard", "◐"],
    ["properties", "▤"],
    ["rooms", "▦"],
    ["tenants", "♦"],
    ["charges", "₱"],
    ["billing", "▥"],
    ["payments", "✓"],
    ["reports", "▣"],
  ];
  return (
    <aside className="app-side" style={{ width: 64, padding: "16px 8px" }}>
      <div className="brand" style={{ justifyContent: "center", marginBottom: 18 }}>
        <span className="bee">●</span>
      </div>
      <nav style={{ alignItems: "center" }}>
        {items.map(([k, glyph]) => (
          <a key={k} href="#" className={k === active ? "active" : ""}
             style={{ justifyContent: "center", width: 40, height: 40, padding: 0, fontSize: 18 }}>
            <span className="glyph" style={{ width: "auto" }}>{glyph}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

// Top horizontal nav (alternate)
const TopNav = ({ active = "dashboard" }) => {
  const items = [
    ["dashboard", "Dashboard"],
    ["properties", "Properties"],
    ["rooms", "Rooms"],
    ["tenants", "Tenants"],
    ["charges", "Charges"],
    ["billing", "Billing"],
    ["payments", "Payments"],
    ["reports", "Reports"],
  ];
  return (
    <header className="app-top">
      <div className="brand"><span className="bee">●</span> BillBee</div>
      <nav>
        {items.map(([k, label]) => (
          <a key={k} href="#" className={k === active ? "active" : ""}>{label}</a>
        ))}
      </nav>
      <span className="spacer" />
      <div className="search">⌕ search anything…</div>
      <button className="icon-btn"><span>🔔</span><span className="dot">3</span></button>
      <button className="icon-btn" title="Profile">JD</button>
    </header>
  );
};

// Variation tab control — switches between sub-options inside a screen
const VarTabs = ({ tabs, active, onChange }) => (
  <div className="variation-tabs">
    {tabs.map((t, i) => (
      <button
        key={i}
        className={`var-tab ${i === active ? "active" : ""}`}
        onClick={() => onChange(i)}
      >
        <span className="num">v{i + 1}</span>
        <span>{t}</span>
      </button>
    ))}
  </div>
);

const ScreenHead = ({ title, blurb, extra }) => (
  <div className="screen-head">
    <div>
      <h2>{title}</h2>
      {blurb && <div className="blurb">{blurb}</div>}
    </div>
    {extra}
  </div>
);

// Generic screen wrapper that handles variation switching
const Screen = ({ title, blurb, variants }) => {
  const [active, setActive] = React.useState(0);
  const v = variants[active];
  return (
    <div className="screen">
      <ScreenHead title={title} blurb={blurb} />
      <VarTabs tabs={variants.map(x => x.label)} active={active} onChange={setActive} />
      {v.note && <VarNote label={`v${active + 1}`}>{v.note}</VarNote>}
      {v.content}
    </div>
  );
};

Object.assign(window, {
  Frame, SideNav, RailNav, TopNav, VarTabs, ScreenHead, Screen,
});
