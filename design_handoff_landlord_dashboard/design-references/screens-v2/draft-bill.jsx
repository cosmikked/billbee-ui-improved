// v2 Draft Bill — split + breakdown + computation trail, with "from room" / "from tenant" source annotations on each line.

const V2_DraftLines = [
  { label: "Rent share", detail: "A-101 ₱6,000 ÷ 2 active tenants", amt: "₱3,000", source: "room", kind: "rent" },
  { label: "Wi-Fi Fee share", detail: "₱200 ÷ 2 active tenants", amt: "₱100", source: "room", kind: "fixed" },
  { label: "Water share", detail: "₱300 room total ÷ 2 (CSV Mar 8)", amt: "₱150", source: "room·csv", kind: "csv", locked: true },
  { label: "Electricity share", detail: "₱800 room total ÷ 2 (CSV Mar 8)", amt: "₱400", source: "room·csv", kind: "csv", locked: true },
  { label: "Parking Fee", detail: "fixed · tenant-level", amt: "₱500", source: "tenant", kind: "fixed" },
  { label: "Laptop fee", detail: "tenant-specific", amt: "₱100", source: "tenant", kind: "tspec" },
];

const V2_DraftBill = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/billing/drafts/DRAFT-J-Cruz-Mar2026</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="billing" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">billing · cycles · sunset · mar 2026 · drafts · J. Cruz</div>
              <h1>Draft <span className="mono" style={{ color: "var(--ink-muted)" }}>DRAFT-001</span></h1>
              <div className="row" style={{ gap: 8 }}>
                <Tag kind="draft">draft</Tag>
                <span className="muted">Joseph Cruz · A-101 · period Mar 2026 · due Mar 15</span>
              </div>
            </div>
            <div className="row">
              <Btn ghost>← prev</Btn>
              <Btn ghost>next →</Btn>
              <Btn ghost danger>delete</Btn>
              <Btn ghost>regenerate</Btn>
              <Btn primary>post bill</Btn>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            {/* LEFT: grouped composition with source pills */}
            <Card>
              <b className="marker mb-8" style={{ fontSize: 22 }}>Composition</b>

              {[
                { group: "Rent", color: "var(--ink)", items: [V2_DraftLines[0]] },
                { group: "Room charges", color: "#3a6a4a", items: [V2_DraftLines[1], V2_DraftLines[2], V2_DraftLines[3]] },
                { group: "Tenant charges", color: "var(--accent)", items: [V2_DraftLines[4], V2_DraftLines[5]] },
              ].map((g) => (
                <div key={g.group} className="mb-12">
                  <div className="row between mb-8">
                    <span className="row" style={{ gap: 8 }}>
                      <span style={{ width: 10, height: 10, background: g.color, borderRadius: 2 }} />
                      <b>{g.group}</b>
                    </span>
                    <span className="muted mono" style={{ fontSize: 12 }}>{g.items.length} line{g.items.length > 1 ? "s" : ""}</span>
                  </div>
                  {g.items.map((l) => (
                    <div key={l.label} className="row between" style={{ padding: "6px 0", borderBottom: "1px dashed var(--line-soft)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="row" style={{ gap: 6 }}>
                          <b style={{ fontSize: 14 }}>{l.label}</b>
                          <Tag style={{ fontSize: 9, padding: "1px 6px" }}>from {l.source}</Tag>
                          {l.locked && <Tag kind="warn" style={{ fontSize: 9, padding: "1px 6px" }}>🔒 imported</Tag>}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>{l.detail}</div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <span className="mono">{l.amt}</span>
                        {l.locked
                          ? <span title="imported from CSV — fix CSV + regenerate, or add adjustment" style={{ opacity: 0.5 }}>🔒</span>
                          : <Btn sm ghost>edit</Btn>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="row between" style={{ padding: "10px 0", borderTop: "1.5px solid var(--line)" }}>
                <b style={{ fontSize: 18 }}>Total amount due</b>
                <Money value="4,250" big />
              </div>

              <div className="row mt-12">
                <Btn sm ghost>＋ add adjustment</Btn>
                <Btn sm ghost>＋ add discount</Btn>
                <Btn sm ghost>＋ add penalty</Btn>
              </div>

              <Callout warn className="mt-16">
                🔒 <b>Imported CSV shares can't be edited here.</b> If they look wrong, fix the CSV upload and regenerate, or add an adjustment line.
              </Callout>
            </Card>

            {/* RIGHT: breakdown viz + computation trail + post checklist */}
            <div className="col">
              <Card>
                <b className="marker">Breakdown</b>
                <div style={{ display: "flex", height: 28, border: "1.5px solid var(--line)", borderRadius: "var(--radius-pill)", overflow: "hidden", marginTop: 8 }}>
                  <div style={{ width: "70.6%", background: "var(--ink)" }} title="Rent 3,000" />
                  <div style={{ width: "16%", background: "#3a6a4a" }} title="Room charges 650" />
                  <div style={{ width: "14.1%", background: "var(--accent)" }} title="Tenant charges 600" />
                </div>
                <div style={{ fontSize: 12, marginTop: 8 }}>
                  <div className="row between"><span><span style={{ width: 8, height: 8, background: "var(--ink)", display: "inline-block", marginRight: 6 }} />Rent</span><span className="mono">₱3,000 · 71%</span></div>
                  <div className="row between"><span><span style={{ width: 8, height: 8, background: "#3a6a4a", display: "inline-block", marginRight: 6 }} />Room (wifi+water+elec)</span><span className="mono">₱650 · 15%</span></div>
                  <div className="row between"><span><span style={{ width: 8, height: 8, background: "var(--accent)", display: "inline-block", marginRight: 6 }} />Tenant (parking+laptop)</span><span className="mono">₱600 · 14%</span></div>
                </div>
              </Card>

              <Card>
                <b className="marker">Computation trail</b>
                <pre className="mono" style={{ background: "var(--paper-2)", border: "1.5px solid var(--line-soft)", borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.55, margin: "8px 0 0 0", whiteSpace: "pre-wrap" }}>
{`# Room A-101 (split between 2 tenants)
Rent share        3,000   # 6000 ÷ 2  [room]
Wi-Fi share         100   # 200  ÷ 2  [room]
Water share         150   # 300  ÷ 2  [room·csv]
Electricity share   400   # 800  ÷ 2  [room·csv]

# Tenant charges (J. Cruz)
Parking             500   # fixed     [tenant]
Laptop fee          100   # t-spec    [tenant]

# Adjustments
Penalty               0
Discount              0
Advance coverage      0

─────────────────────────
Total amount due  4,250`}
                </pre>
              </Card>

              <Box hl>
                <b>Ready to post?</b>
                <ul style={{ margin: "4px 0 0 16px", fontSize: 13 }}>
                  <li>✓ Due date set (Mar 15)</li>
                  <li>✓ Total ≥ ₱0</li>
                  <li>✓ No duplicate posted bill</li>
                </ul>
                <Btn primary className="mt-8" style={{ width: "100%" }}>Post bill</Btn>
              </Box>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);

window.V2_DraftBill = V2_DraftBill;
