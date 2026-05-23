// v2 Property Hub — the page you reach by clicking "Open" on a Property card.
// Sub-tabs: Overview · Charges · Rooms · Tenants · Bills. Default = Overview.

const V2_HubSubNav = ({ active = "overview" }) => {
  const tabs = [
    ["overview", "Overview"],
    ["charges", "Charges", "5"],
    ["rooms", "Rooms", "8"],
    ["tenants", "Tenants", "11"],
    ["bills", "Bills", "11 mar"],
  ];
  return (
    <div className="row" style={{ gap: 2, borderBottom: "1.5px solid var(--line)", marginBottom: 18 }}>
      {tabs.map(([k, label, count]) => (
        <button key={k} className={`topbar-tab ${k === active ? "active" : ""}`} style={{ fontSize: 14.5 }}>
          {label} {count && <span className="muted mono" style={{ fontSize: 11 }}>{count}</span>}
        </button>
      ))}
    </div>
  );
};

const V2_PropertyHub = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/properties/sunset-apts</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="properties" />
        <main className="app-main">
          {/* property header */}
          <div className="page-head">
            <div>
              <div className="crumbs">properties · sunset apartments</div>
              <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
                <h1>Sunset Apartments</h1>
                <Tag kind="active">active</Tag>
                <Tag kind="paid">ready to bill</Tag>
              </div>
              <div className="subtitle">23 Pinewood St., Quezon City · billing day <b>every 15th</b> · next in <b style={{ color: "var(--accent)" }}>3 days</b></div>
            </div>
            <div className="row">
              <Btn ghost>edit property</Btn>
              <Btn ghost danger>archive</Btn>
              <Btn primary>▥ Generate Mar 2026 bills</Btn>
            </div>
          </div>

          <V2_HubSubNav active="overview" />

          {/* OVERVIEW TAB CONTENT */}

          {/* stat tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            <V2_StatCard label="Rooms" value="8" sub="7 active · 1 maint." />
            <V2_StatCard label="Occupied" value="11/14" sub="3 vacant beds" />
            <V2_StatCard label="Active tenants" value="11" />
            <V2_StatCard label="Billed this mo." value="₱33,700" sub="68% collected" />
          </div>

          {/* main columns */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            {/* LEFT: current cycle + setup checklist */}
            <div className="col">
              {/* current cycle progress */}
              <Card>
                <div className="row between mb-8">
                  <div>
                    <b className="marker" style={{ fontSize: 22 }}>Current cycle · March 2026</b>
                    <div className="muted" style={{ fontSize: 13 }}>billing day Mar 15 · due Mar 15</div>
                  </div>
                  <Btn sm>open cycle →</Btn>
                </div>

                {/* progress bar */}
                <div style={{ display: "flex", height: 14, border: "1.5px solid var(--line)", borderRadius: "var(--radius-pill)", overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: "9%", background: "var(--status-paid)" }} />
                  <div style={{ width: "55%", background: "var(--ink)" }} />
                  <div style={{ width: "18%", background: "var(--line-soft)" }} />
                </div>
                <div className="row gap-lg" style={{ fontSize: 13, flexWrap: "wrap" }}>
                  <span><Tag kind="paid">1 paid</Tag></span>
                  <span><Tag kind="posted">5 posted</Tag></span>
                  <span><Tag kind="draft">2 drafts</Tag></span>
                  <span><Tag kind="overdue">0 overdue</Tag></span>
                  <span className="grow" />
                  <span className="mono soft">3 not yet drafted</span>
                </div>

                <Callout className="mt-12">
                  <b>2 drafts ready to review.</b> Post them to send notices to tenants.
                  <Btn sm style={{ marginLeft: 10 }}>review drafts →</Btn>
                </Callout>
              </Card>

              {/* recent posted bills + recorded payments only */}
              <Card>
                <div className="row between mb-8">
                  <b className="marker" style={{ fontSize: 20 }}>Recent posted bills</b>
                  <Btn sm ghost>open Billing Center →</Btn>
                </div>
                <table className="sk-table" style={{ fontSize: 13 }}>
                  <thead><tr><th>Bill #</th><th>Tenant</th><th>Period</th><th className="num">Total</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td className="mono"><b>BILL-26-00041</b></td><td>J. Cruz</td><td>Mar 2026</td><td className="num mono">₱4,250</td><td><Tag kind="posted">posted</Tag></td></tr>
                    <tr><td className="mono"><b>BILL-26-00040</b></td><td>R. Lim</td><td>Mar 2026</td><td className="num mono">₱4,350</td><td><Tag kind="partial">partial</Tag></td></tr>
                    <tr><td className="mono"><b>BILL-26-00039</b></td><td>A. Tan</td><td>Mar 2026</td><td className="num mono">₱5,900</td><td><Tag kind="paid">paid</Tag></td></tr>
                    <tr><td className="mono"><b>BILL-26-00038</b></td><td>D. Cruz</td><td>Mar 2026</td><td className="num mono">₱4,650</td><td><Tag kind="posted">posted</Tag></td></tr>
                    <tr><td className="mono"><b>BILL-26-00037</b></td><td>L. Yu</td><td>Mar 2026</td><td className="num mono">₱4,650</td><td><Tag kind="posted">posted</Tag></td></tr>
                  </tbody>
                </table>
              </Card>

              <Card>
                <div className="row between mb-8">
                  <b className="marker" style={{ fontSize: 20 }}>Recent payments recorded</b>
                  <Btn sm ghost>open Payments &amp; Receipts →</Btn>
                </div>
                <table className="sk-table" style={{ fontSize: 13 }}>
                  <thead><tr><th>Date</th><th>Tenant</th><th>Bill #</th><th className="num">Amount</th><th>Mode</th><th>Receipt #</th></tr></thead>
                  <tbody>
                    <tr><td className="mono">Mar 9</td><td>J. Cruz</td><td className="mono">BILL-26-00041</td><td className="num mono">₱4,350</td><td>cash</td><td className="mono">RCT-0183</td></tr>
                    <tr><td className="mono">Mar 8</td><td>R. Lim</td><td className="mono">BILL-26-00040</td><td className="num mono">₱3,000</td><td>bank</td><td className="mono">RCT-0182</td></tr>
                    <tr><td className="mono">Mar 7</td><td>A. Tan</td><td className="mono">BILL-26-00039</td><td className="num mono">₱5,900</td><td>e-wallet</td><td className="mono">RCT-0181</td></tr>
                    <tr><td className="mono">Feb 28</td><td>J. Cruz</td><td className="mono">BILL-26-00033</td><td className="num mono">₱3,750</td><td>cash</td><td className="mono">RCT-0178</td></tr>
                  </tbody>
                </table>
              </Card>
            </div>

            {/* RIGHT: property info + quick actions */}
            <div className="col">
              {/* property info */}
              <Card>
                <b className="marker">Property info</b>
                <div style={{ fontSize: 13.5, marginTop: 8 }}>
                  <div className="row between"><span className="muted">Name</span><b>Sunset Apartments</b></div>
                  <div className="row between"><span className="muted">Address</span><span style={{ textAlign: "right", maxWidth: 180 }}>23 Pinewood St., QC</span></div>
                  <div className="row between"><span className="muted">Billing day</span><b className="mono">15</b></div>
                  <div className="row between"><span className="muted">Contact</span><span className="mono">0917-555-1234</span></div>
                  <div className="row between"><span className="muted">Created</span><span className="mono">Mar 2023</span></div>
                </div>
              </Card>

              {/* quick actions specific to property */}
              <Card>
                <b className="marker">Quick actions</b>
                <div className="col mt-8" style={{ gap: 6 }}>
                  <Btn>＋ Add room</Btn>
                  <Btn>＋ Add tenant</Btn>
                  <Btn>＋ Add charge</Btn>
                  <Btn ghost>↻ Send all bill notices</Btn>
                </div>
              </Card>
            </div>
          </div>

          <Callout info className="mt-24">
            <b>Sub-tabs:</b> <b>Charges</b>, <b>Rooms</b>, <b>Tenants</b>, and <b>Bills</b> show the same data as the top-level pages, but filtered to <b>Sunset Apartments</b> only. They reuse those page designs. Default landing tab is <b>Overview</b> (this one).
          </Callout>
        </main>
      </div>
    </div>
  </div>
);

window.V2_PropertyHub = V2_PropertyHub;
window.V2_HubSubNav = V2_HubSubNav;
