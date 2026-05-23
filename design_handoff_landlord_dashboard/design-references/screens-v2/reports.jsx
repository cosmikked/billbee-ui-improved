// v2 Reports — catalog of prebuilt reports + selected report preview.

const V2_Reports = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/reports</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="reports" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">reports</div>
              <h1>Reports</h1>
              <div className="subtitle">choose a report, filter by date/status, export PDF or Excel</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { name: "Billing Summary", desc: "totals billed, collected, outstanding per period & property", glyph: "▥", active: true },
              { name: "Payment Collection", desc: "payments grouped by date / mode / property", glyph: "✓" },
              { name: "Outstanding Balance", desc: "all unpaid balances by tenant", glyph: "₱" },
              { name: "Overdue Bills", desc: "posted bills past due, oldest first", glyph: "!" },
              { name: "Tenant List", desc: "active / moved-out tenants with contact info", glyph: "♦" },
              { name: "Occupancy", desc: "occupied vs vacant rooms by property", glyph: "▦" },
            ].map((r, i) => (
              <Card key={r.name} className={`wobble-${(i % 3) + 1}`} style={{
                padding: 16, cursor: "pointer",
                borderColor: r.active ? "var(--accent)" : undefined,
                background: r.active ? "rgba(232,90,26,0.04)" : undefined,
              }}>
                <div className="row between mb-8">
                  <span className="marker" style={{ fontSize: 28, color: "var(--accent)" }}>{r.glyph}</span>
                  {r.active ? <Tag kind="accent">selected</Tag> : <Btn sm ghost>open →</Btn>}
                </div>
                <b className="marker" style={{ fontSize: 20 }}>{r.name}</b>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{r.desc}</div>
                <div className="row mt-12" style={{ gap: 4 }}>
                  <Tag>pdf</Tag><Tag>excel</Tag><Tag>print</Tag>
                </div>
              </Card>
            ))}
          </div>

          {/* selected report panel */}
          <div className="marker mt-24 mb-8" style={{ fontSize: 22 }}>Selected: Billing Summary</div>
          <Card>
            <div className="row gap-lg mb-12" style={{ flexWrap: "wrap" }}>
              <Field label="From"><Input value="Jan 1, 2026" mono /></Field>
              <Field label="To"><Input value="Mar 31, 2026" mono /></Field>
              <Field label="Property"><Input value="All properties" /></Field>
              <Field label="Status"><Input value="All" /></Field>
              <div style={{ flex: 1 }} />
              <div className="row" style={{ alignItems: "flex-end", gap: 6 }}>
                <Btn>⤓ PDF</Btn>
                <Btn>⤓ Excel</Btn>
                <Btn primary>Run report</Btn>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
              <Box><div className="muted" style={{ fontSize: 11 }}>Total billed</div><div className="marker mono" style={{ fontSize: 24 }}>₱182,400</div></Box>
              <Box><div className="muted" style={{ fontSize: 11 }}>Collected</div><div className="marker mono" style={{ fontSize: 24, color: "var(--status-paid)" }}>₱141,700</div></Box>
              <Box><div className="muted" style={{ fontSize: 11 }}>Outstanding</div><div className="marker mono" style={{ fontSize: 24, color: "var(--accent)" }}>₱40,700</div></Box>
              <Box><div className="muted" style={{ fontSize: 11 }}>Collection rate</div><div className="marker" style={{ fontSize: 24 }}>77.7%</div></Box>
            </div>

            <table className="sk-table">
              <thead><tr><th>Period</th><th>Property</th><th className="num">Bills</th><th className="num">Billed</th><th className="num">Paid</th><th className="num">Outstanding</th></tr></thead>
              <tbody>
                <tr><td>Jan 2026</td><td>Sunset Apts</td><td className="num">11</td><td className="num mono">₱45,200</td><td className="num mono">₱45,200</td><td className="num mono">₱0</td></tr>
                <tr><td>Jan 2026</td><td>Greenview</td><td className="num">5</td><td className="num mono">₱22,000</td><td className="num mono">₱18,000</td><td className="num mono">₱4,000</td></tr>
                <tr><td>Feb 2026</td><td>Sunset Apts</td><td className="num">11</td><td className="num mono">₱46,800</td><td className="num mono">₱42,500</td><td className="num mono">₱4,300</td></tr>
                <tr><td>Feb 2026</td><td>Greenview</td><td className="num">5</td><td className="num mono">₱22,000</td><td className="num mono">₱22,000</td><td className="num mono">₱0</td></tr>
                <tr><td>Mar 2026</td><td>Sunset Apts</td><td className="num">11</td><td className="num mono">₱46,400</td><td className="num mono">₱14,000</td><td className="num mono">₱32,400</td></tr>
                <tr style={{ background: "var(--paper-2)" }}>
                  <td><b>Totals</b></td><td></td>
                  <td className="num"><b>43</b></td>
                  <td className="num mono"><b>₱182,400</b></td>
                  <td className="num mono"><b>₱141,700</b></td>
                  <td className="num mono" style={{ color: "var(--accent)" }}><b>₱40,700</b></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  </div>
);

window.V2_Reports = V2_Reports;
