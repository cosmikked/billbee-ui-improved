// v2 Dashboard — 8 stat cards + collections chart (2/3) + quick actions (1/3). No recent-activity feed.

const V2_StatCard = ({ label, value, sub, accent }) => (
  <div className="sk-card" style={{ padding: 12, minWidth: 0 }}>
    <div className="muted" style={{ fontSize: 12 }}>{label}</div>
    <div className="marker" style={{ fontSize: 28, fontWeight: 700, color: accent ? "var(--accent)" : "var(--ink)" }}>{value}</div>
    {sub && <div className="muted" style={{ fontSize: 11.5 }}>{sub}</div>}
  </div>
);

const V2_Dashboard = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/dashboard</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="dashboard" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">landlord · home</div>
              <h1>Good evening, Maria 👋</h1>
              <div className="subtitle">2 properties · billing day for <b>Sunset Apartments</b> in <b style={{ color: "var(--accent)" }}>3 days</b></div>
            </div>
            <div className="row">
              <Btn>⌕ Search</Btn>
              <Btn primary>＋ Generate Bills</Btn>
            </div>
          </div>

          <Callout>
            <b>Heads up.</b> Sunset Apartments bills on the 15th. Prep tenants & non-fixed charges before then.
            <Btn sm className="primary" style={{ marginLeft: 10 }}>Start prep →</Btn>
          </Callout>

          {/* 8 stat cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 16 }}>
            <V2_StatCard label="Properties" value="2" sub="2 active" />
            <V2_StatCard label="Rooms" value="14" sub="11 occupied · 3 vacant" />
            <V2_StatCard label="Active tenants" value="18" />
            <V2_StatCard label="Receipts (this mo.)" value="11" />
            <V2_StatCard label="Draft bills" value="0" sub="ready to generate" />
            <V2_StatCard label="Unpaid posted" value="6" accent />
            <V2_StatCard label="Overdue" value="2" accent sub="₱8,200 past due" />
            <V2_StatCard label="Collected (this mo.)" value="₱42,300" sub="of ₱61,945" />
          </div>

          {/* Chart 2/3 + Quick Actions 1/3 */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginTop: 14 }}>
            <Card>
              <div className="row between mb-12">
                <div>
                  <b className="marker" style={{ fontSize: 22 }}>Collections — last 6 months</b>
                  <div className="muted" style={{ fontSize: 13 }}>billed vs collected · all properties</div>
                </div>
                <div className="row">
                  <Btn sm ghost>property: all ▾</Btn>
                  <Btn sm ghost>6 mo</Btn>
                </div>
              </div>

              <Box className="mb-8" style={{ padding: 12 }}>
                <svg viewBox="0 0 560 200" width="100%" height="200">
                  {/* y-axis labels */}
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <line x1="40" y1={20 + i * 40} x2="555" y2={20 + i * 40} stroke="var(--line-soft)" strokeDasharray="2 4" />
                      <text x="35" y={24 + i * 40} fontSize="9" fontFamily="JetBrains Mono" textAnchor="end" fill="var(--ink-muted)">
                        {["₱80k","₱60k","₱40k","₱20k"][i]}
                      </text>
                    </g>
                  ))}

                  {/* bars: billed (light) + collected (ink) per month */}
                  {[
                    { m: "Oct", b: 55, c: 52 },
                    { m: "Nov", b: 58, c: 56 },
                    { m: "Dec", b: 62, c: 47 },
                    { m: "Jan", b: 67, c: 63 },
                    { m: "Feb", b: 68, c: 64 },
                    { m: "Mar", b: 62, c: 28 },
                  ].map((d, i) => {
                    const x = 70 + i * 85;
                    const sc = 2;
                    return (
                      <g key={i}>
                        <rect x={x} y={180 - d.b * sc} width="28" height={d.b * sc} fill="var(--paper-2)" stroke="var(--line-soft)" strokeWidth="1.5" />
                        <rect x={x + 28} y={180 - d.c * sc} width="28" height={d.c * sc} fill="var(--ink)" />
                        {i === 5 && (
                          <rect x={x + 28} y={180 - d.c * sc} width="28" height={d.c * sc} fill="var(--accent)" opacity="0.85" />
                        )}
                        <text x={x + 28} y="195" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" fill="var(--ink-muted)">{d.m}</text>
                      </g>
                    );
                  })}

                  {/* legend */}
                  <rect x="420" y="6" width="10" height="10" fill="var(--paper-2)" stroke="var(--line-soft)" />
                  <text x="434" y="14" fontSize="10" fontFamily="Patrick Hand">billed</text>
                  <rect x="475" y="6" width="10" height="10" fill="var(--ink)" />
                  <text x="489" y="14" fontSize="10" fontFamily="Patrick Hand">collected</text>
                </svg>
              </Box>

              <div className="row gap-lg" style={{ fontSize: 13 }}>
                <span><b className="mono">68%</b> <span className="muted">collected this month</span></span>
                <span><b className="mono">96%</b> <span className="muted">avg over 6 mo</span></span>
                <span className="grow" />
                <span className="muted">last updated <span className="mono">just now</span></span>
              </div>
            </Card>

            <Card>
              <b className="marker mb-12" style={{ fontSize: 22 }}>Quick actions</b>
              <div className="col mt-8" style={{ gap: 8 }}>
                <Btn>＋ Add property</Btn>
                <Btn>＋ Add tenant</Btn>
                <Btn primary>▥ Generate bills</Btn>
                <Btn>✓ Record payment</Btn>
                <Btn ghost>▣ View reports</Btn>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  </div>
);

window.V2_Dashboard = V2_Dashboard;
