// v2 Notifications — bell dropdown primary (with toasts), inbox is the overflow when clicking "view all".

const V2_Notifications = () => {
  const [view, setView] = React.useState("bell");
  return (
    <div className="screen">
      <div className="row mb-12" style={{ gap: 6 }}>
        <button className={`var-tab ${view === "bell" ? "active" : ""}`} onClick={() => setView("bell")}>
          <span className="num">A</span><span>Bell dropdown + toasts</span>
        </button>
        <button className={`var-tab ${view === "inbox" ? "active" : ""}`} onClick={() => setView("inbox")}>
          <span className="num">B</span><span>Inbox (overflow)</span>
        </button>
        <span className="muted" style={{ fontSize: 13, marginLeft: 8, alignSelf: "center" }}>
          primary = bell · "view all →" goes to inbox
        </span>
      </div>

      {view === "bell" ? <V2_NotifBell /> : <V2_NotifInbox />}
    </div>
  );
};

const V2_NotifBell = () => (
  <div className="frame">
    <div className="frame-bar">
      <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
      <span className="frame-url">billbee.app/dashboard</span>
    </div>
    <div className="frame-body">
      <SideNavV2 active="dashboard" />
      <main className="app-main" style={{ position: "relative" }}>
        <div className="row between mb-16">
          <h1 style={{ fontSize: 26 }}>Dashboard</h1>
          <div className="row">
            <button className="icon-btn" style={{ background: "var(--accent)", color: "white", borderColor: "var(--line)" }}>
              <span>🔔</span><span className="dot">3</span>
            </button>
            <button className="icon-btn">JD</button>
          </div>
        </div>

        <div style={{ opacity: 0.4, pointerEvents: "none" }}>
          <Card><div className="empty-state" style={{ padding: 30 }}><div className="big">dashboard widgets…</div></div></Card>
        </div>

        {/* Bell dropdown */}
        <Card style={{
          position: "absolute", top: 60, right: 26, width: 360,
          zIndex: 10, padding: 0, overflow: "hidden",
          boxShadow: "4px 6px 0 rgba(0,0,0,0.12)",
        }}>
          <div className="row between" style={{ padding: "10px 14px", borderBottom: "1.5px solid var(--line-soft)", background: "var(--paper-2)" }}>
            <b className="marker" style={{ fontSize: 20 }}>Notifications</b>
            <div className="row">
              <Btn sm ghost>mark all read</Btn>
              <Btn sm ghost>⚙</Btn>
            </div>
          </div>

          <div className="row" style={{ padding: "6px 14px", borderBottom: "1.5px solid var(--line-soft)", gap: 6, fontSize: 12 }}>
            <Tag kind="active">All</Tag><Tag>Bills</Tag><Tag>Payments</Tag><Tag>Reminders</Tag>
          </div>

          {[
            { dot: true, icon: "▥", title: "Billing reminder", body: "Sunset Apts bills on Mar 15. Start prep.", ago: "2h", kind: "accent" },
            { dot: true, icon: "✉", title: "Email failed", body: "BILL-26-00037 to L. Yu — bounced. Resend?", ago: "1h", kind: "fail" },
            { dot: true, icon: "₱", title: "Payment recorded", body: "R. Lim · ₱3,000 cash · BILL-26-00040", ago: "20m", kind: "ok" },
            { dot: false, icon: "▥", title: "Draft bills generated", body: "11 drafts for Mar 2026 · ready to review", ago: "yest", kind: "ok" },
            { dot: false, icon: "!", title: "Overdue bill", body: "J. Cruz BILL-25-00498 · 12 days past due", ago: "2d", kind: "fail" },
          ].map((n, i) => (
            <div key={i} className="row" style={{
              padding: "10px 14px",
              borderBottom: "1px dashed var(--line-soft)",
              background: n.dot ? "rgba(232,90,26,0.04)" : "var(--paper)",
              gap: 10,
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 6,
                background: n.kind === "fail" ? "#f9d3cd" : n.kind === "ok" ? "#d4ead8" : "var(--accent-soft)",
                border: "1.5px solid var(--line)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-marker)", fontSize: 16,
              }}>{n.icon}</span>
              <div style={{ flex: 1, fontSize: 13 }}>
                <div className="row between">
                  <b>{n.title}</b>
                  <span className="mono muted" style={{ fontSize: 10 }}>{n.ago}</span>
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{n.body}</div>
              </div>
              {n.dot && <span style={{ width: 8, height: 8, borderRadius: 50, background: "var(--accent)" }} />}
            </div>
          ))}

          <div className="row between" style={{ padding: 10, background: "var(--paper-2)" }}>
            <Btn sm ghost>view all → (inbox)</Btn>
            <span className="muted mono" style={{ fontSize: 11 }}>preferences</span>
          </div>
        </Card>

        {/* TOASTS in the corner */}
        <div style={{ position: "absolute", bottom: 20, right: 26, display: "flex", flexDirection: "column", gap: 10 }}>
          <Card style={{ padding: "10px 14px", background: "#d4ead8", borderColor: "#1f5a32" }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ fontFamily: "var(--font-marker)", fontSize: 20, color: "#1f5a32" }}>✓</span>
              <div>
                <b>Payment recorded</b>
                <div className="muted" style={{ fontSize: 12 }}>Receipt RCT-0183 generated.</div>
              </div>
              <Btn sm ghost>view ↗</Btn>
              <Btn sm ghost>✕</Btn>
            </div>
          </Card>
          <Card style={{ padding: "10px 14px", background: "#f9d3cd", borderColor: "#8a2a1c" }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ fontFamily: "var(--font-marker)", fontSize: 20, color: "#8a2a1c" }}>⚠</span>
              <div>
                <b>Overpayment blocked</b>
                <div className="muted" style={{ fontSize: 12 }}>₱5,000 exceeds balance ₱4,250.</div>
              </div>
              <Btn sm ghost>✕</Btn>
            </div>
          </Card>
        </div>
      </main>
    </div>
  </div>
);

const V2_NotifInbox = () => (
  <div className="frame">
    <div className="frame-bar">
      <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
      <span className="frame-url">billbee.app/notifications</span>
    </div>
    <div className="frame-body">
      <SideNavV2 active="dashboard" />
      <main className="app-main">
        <div className="page-head">
          <div>
            <div className="crumbs">notifications · inbox</div>
            <h1>Inbox</h1>
            <div className="subtitle">overflow from the bell · groupable, archivable, searchable</div>
          </div>
          <div className="row">
            <Btn ghost>mark all read</Btn>
            <Btn ghost>⚙ preferences</Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}>
          <Card>
            <div className="col" style={{ gap: 4 }}>
              <div className="sk-box row between" style={{ padding: 6, background: "var(--ink)", color: "var(--paper)" }}><span>All</span><span className="mono">12</span></div>
              <div className="sk-box row between" style={{ padding: 6 }}><span>Billing</span><span className="mono">4</span></div>
              <div className="sk-box row between" style={{ padding: 6 }}><span>Payments</span><span className="mono">5</span></div>
              <div className="sk-box row between" style={{ padding: 6 }}><span>Email failures</span><span className="mono">1</span></div>
              <div className="sk-box row between" style={{ padding: 6 }}><span>Reminders</span><span className="mono">2</span></div>
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            {[
              { title: "Billing reminder · Sunset Apts", body: "Bills due in 6 days. Start prep.", ago: "today, 9:00am", unread: true },
              { title: "Email failed · L. Yu", body: "BILL-26-00037 bounced. Verify address.", ago: "today, 8:14am", unread: true },
              { title: "Payment recorded", body: "R. Lim ₱3,000 cash · BILL-26-00040", ago: "yesterday, 4:02pm", unread: true },
              { title: "Receipt emailed", body: "RCT-0182 sent to rico@mail.com", ago: "yesterday, 4:03pm", unread: false },
              { title: "Draft bills generated", body: "11 drafts for Mar 2026", ago: "yesterday, 11:50am", unread: false },
              { title: "Overdue alert", body: "BILL-25-00498 J. Cruz · 12 days past due", ago: "2 days ago", unread: false },
              { title: "Tenant moved out", body: "M. Reyes from A-103", ago: "2 days ago", unread: false },
            ].map((n, i) => (
              <div key={i} className="row" style={{
                padding: 14, borderBottom: "1px dashed var(--line-soft)", gap: 10,
                background: n.unread ? "rgba(232,90,26,0.04)" : "var(--paper)",
              }}>
                <input type="checkbox" />
                {n.unread && <span style={{ width: 8, height: 8, borderRadius: 50, background: "var(--accent)" }} />}
                <div style={{ flex: 1 }}>
                  <div className="row between">
                    <b>{n.title}</b>
                    <span className="mono muted" style={{ fontSize: 11 }}>{n.ago}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{n.body}</div>
                </div>
                <Btn sm ghost>view ↗</Btn>
                <Btn sm ghost>✕</Btn>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </div>
  </div>
);

window.V2_Notifications = V2_Notifications;
