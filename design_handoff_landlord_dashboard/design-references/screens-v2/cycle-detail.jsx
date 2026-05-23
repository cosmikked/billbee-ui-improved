// v2 Cycle Detail — redesigned. Phase-driven workspace for one property × one billing month.

const V2_cycleBillsClean = [
  { id: "DRAFT-001", tenant: "C. Mendez", room: "B-203", total: "₱3,950", bal: "—",     status: "draft" },
  { id: "DRAFT-002", tenant: "P. Reyes",  room: "B-203", total: "₱3,950", bal: "—",     status: "draft" },
  { id: "BILL-26-00041", tenant: "J. Cruz", room: "A-101", total: "₱4,250", bal: "₱4,250", status: "posted",  email: "not sent" },
  { id: "BILL-26-00040", tenant: "R. Lim",  room: "A-101", total: "₱4,350", bal: "₱1,350", status: "partial", email: "sent" },
  { id: "BILL-26-00039", tenant: "A. Tan",  room: "A-102", total: "₱5,900", bal: "₱0",     status: "paid",    email: "sent" },
  { id: "BILL-26-00038", tenant: "D. Cruz", room: "A-104", total: "₱4,650", bal: "₱4,650", status: "posted",  email: "not sent" },
  { id: "BILL-26-00037", tenant: "L. Yu",   room: "A-104", total: "₱4,650", bal: "₱4,650", status: "posted",  email: "failed" },
  { id: "BILL-26-00036", tenant: "B. So",   room: "B-201", total: "₱3,800", bal: "₱3,800", status: "posted",  email: "not sent" },
];

// Phase stepper specific to a cycle
const V2_PhaseStepper = ({ current = 1 }) => {
  const phases = [
    { label: "Drafts",       count: 2, sub: "to review & post" },
    { label: "Post & notify", count: 5, sub: "posted · 4 unsent" },
    { label: "Collect",      count: 5, sub: "₱27,800 outstanding" },
    { label: "Closed",       count: null, sub: "all paid" },
  ];
  return (
    <div className="sk-card" style={{ padding: "12px 14px", marginBottom: 14 }}>
      <div className="row" style={{ gap: 0, alignItems: "stretch" }}>
        {phases.map((p, i) => {
          const isCurrent = i === current;
          const isDone = i < current;
          return (
            <React.Fragment key={p.label}>
              <div style={{
                flex: 1,
                padding: "8px 12px",
                background: isCurrent ? "var(--accent-soft)" : isDone ? "var(--paper-2)" : "transparent",
                borderRadius: 8,
                border: isCurrent ? "1.5px solid var(--accent)" : "1.5px dashed var(--line-soft)",
              }}>
                <div className="row" style={{ gap: 6, alignItems: "center" }}>
                  <span className="marker" style={{
                    fontSize: 14,
                    width: 22, height: 22, borderRadius: 50,
                    background: isCurrent ? "var(--accent)" : isDone ? "var(--ink)" : "var(--paper)",
                    color: (isCurrent || isDone) ? "var(--paper)" : "var(--ink-muted)",
                    border: "1.5px solid var(--line)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>{isDone ? "✓" : i + 1}</span>
                  <b style={{ fontSize: 14 }}>{p.label}</b>
                  {p.count !== null && (
                    <span className="mono soft" style={{ fontSize: 11 }}>· {p.count}</span>
                  )}
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2, paddingLeft: 28 }}>{p.sub}</div>
              </div>
              {i < phases.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 4px", color: "var(--line-soft)", fontFamily: "var(--font-mono)" }}>→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const V2_CycleDetail = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/billing/cycles/sunset-2026-03</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="billing" />
        <main className="app-main">
          {/* HEADER — name + dates + ONE primary action + more menu */}
          <div className="page-head">
            <div>
              <div className="crumbs">billing · cycles · sunset · march 2026</div>
              <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
                <h1>Sunset Apts · March 2026</h1>
                <Tag kind="active">in progress</Tag>
              </div>
              <div className="subtitle">
                billing day <b>Mar 15</b> · due <b>Mar 15</b>
                <span className="muted"> · </span>
                <span style={{ color: "var(--accent)" }}><b>6 days</b> until due</span>
              </div>
            </div>
            <div className="row">
              <Btn primary className="lg">Post 2 drafts →</Btn>
              <Btn>⋯ more actions</Btn>
            </div>
          </div>

          {/* PHASE STEPPER */}
          <V2_PhaseStepper current={1} />

          {/* 4 STAT TILES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            <V2_StatCard label="Billed" value="₱33,700" sub="8 of 11 bills created" />
            <V2_StatCard label="Collected" value="₱5,900" sub="18% so far" />
            <V2_StatCard label="Outstanding" value="₱27,800" accent />
            <V2_StatCard label="Days to due" value="6" sub="due Mar 15" />
          </div>

          {/* MISSING-BILLS BANNER */}
          <Callout warn className="mb-12">
            <b>3 tenants in this cycle don't have bills yet</b> — E. Ong, M. Sy, K. Dela Cruz (all B-204).
            <Btn sm style={{ marginLeft: 10 }}>Generate their bills →</Btn>
          </Callout>

          {/* FILTER CHIPS (default to current phase) */}
          <div className="row mb-12" style={{ gap: 6, flexWrap: "wrap" }}>
            <Btn sm>All (8)</Btn>
            <Btn sm primary>Drafts (2)</Btn>
            <Btn sm>Posted unsent (3)</Btn>
            <Btn sm>Partial / Paid (2)</Btn>
            <Btn sm>Failed email (1)</Btn>
            <Btn sm>Overdue (0)</Btn>
            <span className="grow" />
            <div className="search mono" style={{ fontSize: 12.5 }}>⌕ tenant or bill #…</div>
          </div>

          {/* BILLS TABLE — real bills only, inline row actions */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table className="sk-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Bill #</th><th>Tenant</th><th>Room</th>
                  <th className="num">Total</th><th className="num">Balance</th>
                  <th>Status</th><th>Email</th>
                  <th>Quick action</th>
                </tr>
              </thead>
              <tbody>
                {V2_cycleBillsClean.map((b) => (
                  <tr key={b.id}>
                    <td><input type="checkbox" /></td>
                    <td className="mono"><b>{b.id}</b></td>
                    <td>{b.tenant}</td>
                    <td className="mono">{b.room}</td>
                    <td className="num mono">{b.total}</td>
                    <td className="num mono">{b.bal}</td>
                    <td><Tag kind={b.status}>{b.status}</Tag></td>
                    <td>
                      {b.status === "draft"
                        ? <span className="muted">—</span>
                        : b.status === "paid"
                          ? <Tag>n/a</Tag>
                          : <Tag kind={b.email === "sent" ? "paid" : b.email === "failed" ? "overdue" : "draft"}>{b.email}</Tag>}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 4 }}>
                        {b.status === "draft" && <Btn sm primary>post</Btn>}
                        {b.status === "posted" && b.email === "not sent" && <Btn sm>send notice</Btn>}
                        {b.status === "posted" && b.email === "failed" && <Btn sm danger>retry email</Btn>}
                        {b.status === "posted" && b.email === "sent" && <Btn sm>record payment</Btn>}
                        {b.status === "partial" && <Btn sm>record payment</Btn>}
                        {b.status === "paid" && <Btn sm ghost>view receipt</Btn>}
                        <Btn sm ghost>⋯</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* BULK ACTION BAR (only visible when rows selected — shown here for reference) */}
          <Callout info className="mt-12">
            <b>Selected 2 drafts</b> · <Btn sm style={{ marginLeft: 4 }}>Post selected</Btn> · <Btn sm ghost danger>Delete</Btn> · <Btn sm ghost>Regenerate</Btn>
          </Callout>

          {/* CYCLE CONTEXT — collapsible disclosure at the bottom */}
          <details style={{ marginTop: 22 }}>
            <summary style={{
              cursor: "pointer", padding: "10px 14px",
              background: "var(--paper-2)", border: "1.5px dashed var(--line-soft)",
              borderRadius: 8, fontFamily: "var(--font-marker)", fontSize: 16,
              userSelect: "none",
            }}>
              ▸ Cycle context (CSV import, generated by, when)
            </summary>
            <div style={{ padding: "12px 16px", border: "1.5px dashed var(--line-soft)", borderTop: "none", borderRadius: "0 0 8px 8px", fontSize: 13 }}>
              <div className="row between" style={{ padding: "4px 0" }}>
                <span className="muted">CSV imported</span>
                <span className="mono">sunset-mar-2026.csv · Mar 8 · 11:50a · 6 rooms · 0 errors · 2 warnings</span>
              </div>
              <div className="row between" style={{ padding: "4px 0" }}>
                <span className="muted">Drafts generated</span>
                <span className="mono">Mar 8 · 11:52a · by Maria</span>
              </div>
              <div className="row between" style={{ padding: "4px 0" }}>
                <span className="muted">First post</span>
                <span className="mono">Mar 9 · 06:14p</span>
              </div>
              <div className="row mt-8" style={{ gap: 6 }}>
                <Btn sm ghost>↻ re-upload CSV &amp; regenerate</Btn>
                <Btn sm ghost>view CSV review →</Btn>
              </div>
            </div>
          </details>
        </main>
      </div>
    </div>
  </div>
);

window.V2_CycleDetail = V2_CycleDetail;
