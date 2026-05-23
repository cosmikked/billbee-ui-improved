// v2 Tenant Detail — at /tenants/:id, master-detail layout (v3 design).
// Charges attached are now scoped to tenant-level only (room-level charges live on the room).

const V2_TenantDetail = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/tenants/joseph-cruz</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="tenants" />
        <main className="app-main" style={{ display: "flex", gap: 14, padding: "22px 22px 0 22px" }}>
          {/* left: tenant list (doubles as nav) */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div className="row between mb-12">
              <h1 style={{ fontSize: 20 }}>Tenants</h1>
              <Btn primary sm>＋</Btn>
            </div>
            <div className="search mono mb-12" style={{ fontSize: 12 }}>⌕ search…</div>
            <div className="col" style={{ gap: 4 }}>
              {V2_tenantsData.slice(0, 7).map((t, i) => (
                <div key={t.name} className="sk-box" style={{
                  padding: 8, cursor: "pointer",
                  background: i === 0 ? "var(--ink)" : "var(--paper)",
                  color: i === 0 ? "var(--paper)" : "var(--ink)",
                }}>
                  <div className="row between">
                    <b>{t.name}</b>
                    <Tag kind={t.status === "moved" ? "void" : t.status} style={{ fontSize: 10 }}>{t.status}</Tag>
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.75 }}>{t.room} · {t.phone}</div>
                </div>
              ))}
            </div>
            <div className="row mt-12" style={{ justifyContent: "center" }}>
              <Btn sm ghost>see all {V2_tenantsData.length} →</Btn>
            </div>
          </div>

          {/* right: tenant detail */}
          <div className="grow" style={{ borderLeft: "1.5px solid var(--line-soft)", paddingLeft: 18, minWidth: 0 }}>
            <div className="row between mb-12">
              <div>
                <div className="crumbs">tenants · joseph cruz</div>
                <h1 style={{ fontSize: 28 }}>Joseph Cruz</h1>
                <div className="row" style={{ gap: 6 }}>
                  <Tag kind="active">active</Tag>
                  <span className="muted">Sunset · A-101 · since Jan 2024</span>
                </div>
              </div>
              <div className="row">
                <Btn sm>↻ Transfer room</Btn>
                <Btn sm danger>↗ Move out</Btn>
                <Btn sm primary>save</Btn>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <Card style={{ padding: 14, marginBottom: 12 }}>
                  <b className="marker">Contact</b>
                  <Field label="Full name" required><Input value="Joseph Cruz" /></Field>
                  <Field label="Phone" required><Input value="0917-555-0011" mono /></Field>
                  <Field label="Email" hint="for bill/receipt notices"><Input value="jcruz@mail.com" mono /></Field>
                  <Field label="Emergency contact"><Input value="Liza Cruz · 0918-444-1234" /></Field>
                </Card>

                <Card style={{ padding: 14 }}>
                  <div className="row between mb-8">
                    <b className="marker">Tenant charges attached</b>
                    <Btn sm ghost>＋ from catalog</Btn>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                    Tenant-level &amp; tenant-specific charges only. <b>Water / Electricity / Wi-Fi</b> come from <b>Room A-101</b>.
                  </div>
                  <div className="col" style={{ gap: 4, fontSize: 13.5 }}>
                    <div className="sk-box row between" style={{ padding: 8 }}>
                      <span><b>Parking Fee</b> <Tag style={{ marginLeft: 4 }}>fixed</Tag></span>
                      <span className="mono">₱500</span>
                    </div>
                    <div className="sk-box row between" style={{ padding: 8 }}>
                      <span><b>Laptop fee</b> <Tag kind="accent" style={{ marginLeft: 4 }}>tenant-spec</Tag></span>
                      <span className="mono">₱100</span>
                    </div>
                  </div>
                  <Box dashed className="mt-8" style={{ padding: 8, fontSize: 12 }}>
                    Inherited from room: <span className="mono">Water · Electricity · Wi-Fi Fee</span>
                  </Box>
                </Card>
              </div>

              <div>
                <Card style={{ padding: 14, marginBottom: 12 }}>
                  <b className="marker">Assignment</b>
                  <div style={{ fontSize: 13.5, marginTop: 8 }}>
                    <div className="row between"><span className="muted">Property</span><b>Sunset Apartments</b></div>
                    <div className="row between"><span className="muted">Room</span><b className="mono">A-101</b></div>
                    <div className="row between"><span className="muted">Move-in date</span><b>Jan 14, 2024</b></div>
                    <div className="row between"><span className="muted">Rent share</span><b className="mono">₱3,000</b></div>
                    <div className="row between"><span className="muted">Room charges share</span><b className="mono">~₱650</b></div>
                  </div>
                </Card>

                <Card style={{ padding: 14, marginBottom: 12 }}>
                  <div className="row between mb-8">
                    <b className="marker">Billing history</b>
                    <Btn sm ghost>see all →</Btn>
                  </div>
                  <table className="sk-table" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td className="mono">MAR</td><td>BILL-26-00041</td><td className="num mono">₱4,350</td><td><Tag kind="posted">posted</Tag></td></tr>
                      <tr><td className="mono">FEB</td><td>BILL-26-00033</td><td className="num mono">₱3,750</td><td><Tag kind="paid">paid</Tag></td></tr>
                      <tr><td className="mono">JAN</td><td>BILL-26-00018</td><td className="num mono">₱3,600</td><td><Tag kind="paid">paid</Tag></td></tr>
                      <tr><td className="mono">DEC</td><td>BILL-25-00498</td><td className="num mono">₱4,100</td><td><Tag kind="overdue">overdue</Tag></td></tr>
                    </tbody>
                  </table>
                </Card>

                <Card style={{ padding: 14 }}>
                  <b className="marker">Payments history</b>
                  <table className="sk-table" style={{ fontSize: 13, marginTop: 4 }}>
                    <tbody>
                      <tr><td className="mono">Feb 28</td><td className="num mono">₱3,750</td><td>cash</td><td className="mono">RCT-0178</td></tr>
                      <tr><td className="mono">Jan 30</td><td className="num mono">₱3,600</td><td>e-wallet</td><td className="mono">RCT-0156</td></tr>
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>

            {/* move-out + transfer drawers shown side-by-side for reference */}
            <Callout warn className="mt-24">
              <b>Move-out &amp; Transfer drawers ↓</b> — open from the buttons in the top-right.
            </Callout>

            <div className="split-canvas mt-12">
              <Card style={{ padding: 14, width: 360, flexShrink: 0 }}>
                <div className="row between mb-8"><b className="marker" style={{ fontSize: 20 }}>Move out · Joseph Cruz</b><Btn sm ghost>✕</Btn></div>
                <Field label="Move-out date" required><Input value="Mar 31, 2026" mono /></Field>
                <Field label="Reason"><Input placeholder="contract ended / personal" /></Field>
                <Field label="Notes"><Input placeholder="optional" /></Field>
                <Callout warn>⚠ 1 <b>unpaid posted bill</b> (₱4,100, Dec). Move-out allowed; bill stays payable.</Callout>
                <div className="row mt-12" style={{ justifyContent: "flex-end", gap: 8 }}>
                  <Btn>Cancel</Btn>
                  <Btn primary danger>Confirm move out</Btn>
                </div>
              </Card>

              <Card style={{ padding: 14, width: 360, flexShrink: 0 }}>
                <div className="row between mb-8"><b className="marker" style={{ fontSize: 20 }}>Transfer room · J. Cruz</b><Btn sm ghost>✕</Btn></div>
                <Field label="From"><Input value="Sunset · A-101 · 2/2 occupants" /></Field>
                <Field label="To (active room w/ capacity)" required>
                  <div className="col" style={{ gap: 4 }}>
                    <div className="sk-box row between" style={{ padding: 6 }}><span className="mono">A-103 (0/2)</span><Tag kind="active">avail</Tag></div>
                    <div className="sk-box row between" style={{ padding: 6, background: "var(--ink)", color: "var(--paper)" }}><span className="mono">A-104 (2/3)</span><Tag kind="active">selected</Tag></div>
                    <div className="sk-box row between" style={{ padding: 6, opacity: 0.4 }}><span className="mono">B-202 maintenance</span><Tag kind="warn">blocked</Tag></div>
                  </div>
                </Field>
                <Field label="Effective date" required hint="≥ move-in date"><Input value="Apr 1, 2026" mono /></Field>
                <Callout info>Old assignment closes Mar 31. New share at A-104: <b className="mono">₱2,667</b>.</Callout>
                <div className="row mt-12" style={{ justifyContent: "flex-end", gap: 8 }}>
                  <Btn>Cancel</Btn>
                  <Btn primary>Transfer →</Btn>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
);

window.V2_TenantDetail = V2_TenantDetail;
