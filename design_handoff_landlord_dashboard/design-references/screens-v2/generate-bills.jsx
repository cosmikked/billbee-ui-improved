// v2 Generate Bills — split view with live preview. 4-step flow shown on step 3 (the dense one).

const V2_GenerateBills = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/billing/generate</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="billing" />
        <main className="app-main" style={{ display: "flex", gap: 14, padding: "22px 22px 0 22px" }}>
          {/* LEFT: stepper + current step content */}
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <div className="row between mb-12">
              <div>
                <div className="crumbs">billing · cycles · sunset · mar 2026 · generate</div>
                <h1 style={{ fontSize: 26 }}>New billing run</h1>
                <div className="subtitle">Mar 2026 · Sunset Apartments</div>
              </div>
              <Btn ghost sm>✕ cancel</Btn>
            </div>

            <Stepper steps={["Setup", "Template", "Upload", "Generate"]} current={2} />

            <Card style={{ padding: 14 }}>
              <b className="marker" style={{ fontSize: 22 }}>Step 3 · Upload &amp; review</b>
              <div className="muted mt-8 mb-12">drop your filled CSV below to validate.</div>

              <Box dashed style={{ padding: 24, textAlign: "center", background: "var(--paper-2)" }}>
                <div className="marker" style={{ fontSize: 22 }}>⤓</div>
                <div>Drop CSV here or <b style={{ color: "var(--accent)" }}>browse</b></div>
                <div className="muted mono" style={{ fontSize: 11 }}>sunset-mar-2026.csv loaded ✓</div>
              </Box>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 12 }}>
                <Box style={{ padding: 8, textAlign: "center" }}>
                  <div className="muted" style={{ fontSize: 11 }}>Total</div><b>6</b>
                </Box>
                <Box style={{ padding: 8, textAlign: "center" }}>
                  <div className="muted" style={{ fontSize: 11 }}>Valid</div>
                  <b style={{ color: "var(--status-paid)" }}>4</b>
                </Box>
                <Box style={{ padding: 8, textAlign: "center" }}>
                  <div className="muted" style={{ fontSize: 11 }}>Warn</div>
                  <b style={{ color: "#7a5a00" }}>2</b>
                </Box>
                <Box style={{ padding: 8, textAlign: "center" }}>
                  <div className="muted" style={{ fontSize: 11 }}>Errors</div>
                  <b style={{ color: "var(--status-overdue)" }}>0</b>
                </Box>
              </div>

              {/* full validation table */}
              <Card className="mt-12" style={{ padding: 0 }}>
                <table className="sk-table" style={{ fontSize: 12.5 }}>
                  <thead><tr><th>Room</th><th className="num">Occ</th><th className="num">Water</th><th className="num">Elec.</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td className="mono">A-101</td><td className="num">2</td><td className="num mono">₱300</td><td className="num mono">₱800</td><td><Tag kind="paid">valid</Tag></td></tr>
                    <tr><td className="mono">A-102</td><td className="num">1</td><td className="num mono">₱200</td><td className="num mono">—</td><td><Tag kind="warn">blank elec</Tag></td></tr>
                    <tr><td className="mono">A-103</td><td className="num">0</td><td className="num mono">₱400</td><td className="num mono">₱600</td><td><Tag kind="warn">no tenants</Tag></td></tr>
                    <tr><td className="mono">A-104</td><td className="num">2</td><td className="num mono">₱350</td><td className="num mono">₱900</td><td><Tag kind="paid">valid</Tag></td></tr>
                    <tr><td className="mono">B-201</td><td className="num">3</td><td className="num mono">₱600</td><td className="num mono">₱1,200</td><td><Tag kind="paid">valid</Tag></td></tr>
                    <tr><td className="mono">B-203</td><td className="num">2</td><td className="num mono">₱400</td><td className="num mono">₱850</td><td><Tag kind="paid">valid</Tag></td></tr>
                  </tbody>
                </table>
              </Card>

              <Callout warn className="mt-12">
                ⚠ A-102: blank electricity → will bill ₱0 if confirmed.<br />
                ⚠ A-103: no active tenants → row skipped.
              </Callout>
            </Card>

            <div className="row mt-12">
              <Btn>← back: template</Btn>
              <span className="grow" />
              <Btn primary>generate 11 drafts →</Btn>
            </div>
          </div>

          {/* RIGHT: live preview */}
          <div style={{ flex: "1 1 380px", minWidth: 320, borderLeft: "1.5px solid var(--line-soft)", paddingLeft: 18 }}>
            <div className="row between mb-12">
              <b className="marker" style={{ fontSize: 22 }}>Live preview</b>
              <Tag kind="accent">11 drafts</Tag>
            </div>

            <Box hl className="mb-12">
              <div className="row between"><span className="muted">Total billed (est.)</span><Money value="46,200" big /></div>
              <div className="row between mt-4"><span className="muted">Avg per tenant</span><span className="mono">₱4,200</span></div>
              <div className="row between"><span className="muted">Replaces existing drafts</span><span className="mono">2</span></div>
            </Box>

            <div className="marker mb-8">Sample · J. Cruz (A-101)</div>
            <Card style={{ padding: 12 }}>
              <table className="sk-table" style={{ fontSize: 12.5 }}>
                <tbody>
                  <tr><td>Rent share</td><td className="num mono">₱3,000</td><td className="mono soft" style={{ fontSize: 10 }}>room</td></tr>
                  <tr><td>Wi-Fi share</td><td className="num mono">₱100</td><td className="mono soft" style={{ fontSize: 10 }}>room</td></tr>
                  <tr><td>Water share</td><td className="num mono">₱150</td><td className="mono soft" style={{ fontSize: 10 }}>room·csv</td></tr>
                  <tr><td>Elec. share</td><td className="num mono">₱400</td><td className="mono soft" style={{ fontSize: 10 }}>room·csv</td></tr>
                  <tr><td>Parking</td><td className="num mono">₱500</td><td className="mono soft" style={{ fontSize: 10 }}>tenant</td></tr>
                  <tr><td>Laptop fee</td><td className="num mono">₱100</td><td className="mono soft" style={{ fontSize: 10 }}>tenant</td></tr>
                  <tr style={{ background: "var(--paper-2)" }}><td><b>Total</b></td><td className="num"><b className="mono">₱4,250</b></td><td></td></tr>
                </tbody>
              </table>
            </Card>

            <div className="marker mt-16 mb-8">All drafts</div>
            <div style={{ maxHeight: 240, overflow: "auto", fontSize: 12.5 }}>
              {["J. Cruz","R. Lim","A. Tan","D. Cruz","L. Yu","B. So","C. Mendez","P. Reyes","E. Ong","M. Sy","K. Dela Cruz"].map((n, i) => (
                <div key={n} className="row between" style={{ padding: "5px 4px", borderBottom: "1px dashed var(--line-soft)" }}>
                  <span>{n}</span>
                  <span className="mono">₱{(3950 + i * 120).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);

window.V2_GenerateBills = V2_GenerateBills;
