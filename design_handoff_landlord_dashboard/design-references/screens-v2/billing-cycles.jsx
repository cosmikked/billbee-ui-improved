// v2 Billing Cycles — period-first cycle view (v3 design).

const V2_BillingCycles = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/billing</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="billing" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">billing · cycles</div>
              <h1>Billing cycles</h1>
              <div className="subtitle">organized by month + property — see the cycle as a whole</div>
            </div>
            <Btn primary>＋ Generate Billings</Btn>
          </div>

          {/* months strip */}
          <div className="row mb-16" style={{ gap: 6, overflow: "auto", paddingBottom: 4 }}>
            {["Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26"].map((m, i) => (
              <div key={m} className="sk-box" style={{
                padding: "8px 14px", minWidth: 110, textAlign: "center", cursor: "pointer",
                background: i === 5 ? "var(--ink)" : "var(--paper)",
                color: i === 5 ? "var(--paper)" : "var(--ink)",
              }}>
                <div className="marker" style={{ fontSize: 18 }}>{m}</div>
                <div className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{i === 5 ? "current" : i < 5 ? "closed" : "future"}</div>
              </div>
            ))}
          </div>

          <div className="marker mb-8" style={{ fontSize: 22 }}>March 2026</div>

          {[
            {
              prop: "Sunset Apartments", day: 15, draft: 2, posted: 5, paid: 1, overdue: 0, total: 8,
              billed: "₱33,700", collected: "₱5,900", inProgress: true,
            },
            {
              prop: "Greenview Residences", day: 5, draft: 0, posted: 0, paid: 0, overdue: 0, total: 0,
              billed: "—", collected: "—", notStarted: true,
            },
          ].map((p) => (
            <Card key={p.prop} style={{ padding: 14, marginBottom: 10 }}>
              <div className="row between mb-8">
                <div>
                  <b className="marker" style={{ fontSize: 20 }}>{p.prop}</b>
                  <div className="muted" style={{ fontSize: 13 }}>billing day {p.day} · period Mar 2026</div>
                </div>
                <div className="row">
                  {p.notStarted
                    ? <Tag kind="warn">not started</Tag>
                    : <Tag kind="active">in progress</Tag>}
                  <Btn sm primary>open cycle →</Btn>
                </div>
              </div>

              {p.notStarted ? (
                <div className="empty-state" style={{ padding: 18 }}>
                  <div className="big">no bills yet</div>
                  <div style={{ marginTop: 4, fontSize: 13 }}>billing day is the 5th — already passed; generate now to catch up</div>
                  <Btn primary className="mt-8">Start prep</Btn>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", height: 12, border: "1.5px solid var(--line)", borderRadius: "var(--radius-pill)", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${(p.paid / p.total) * 100}%`, background: "var(--status-paid)" }} />
                    <div style={{ width: `${(p.posted / p.total) * 100}%`, background: "var(--ink)" }} />
                    <div style={{ width: `${(p.draft / p.total) * 100}%`, background: "var(--line-soft)" }} />
                  </div>
                  <div className="row gap-lg" style={{ fontSize: 13, flexWrap: "wrap" }}>
                    <span><Tag kind="paid">{p.paid} paid</Tag></span>
                    <span><Tag kind="posted">{p.posted} posted</Tag></span>
                    <span><Tag kind="draft">{p.draft} draft</Tag></span>
                    <span><Tag kind="overdue">{p.overdue} overdue</Tag></span>
                    <span className="grow" />
                    <span className="mono soft">billed: <b>{p.billed}</b></span>
                    <span className="mono soft">collected: <b>{p.collected}</b></span>
                  </div>
                </>
              )}
            </Card>
          ))}

          <Callout info className="mt-16">
            <b>Older overdue:</b> 2 bills from Dec 2025 totalling ₱7,300 still unpaid. <Btn sm style={{ marginLeft: 6 }}>view →</Btn>
          </Callout>

          <Box dashed className="mt-16" style={{ padding: 12, fontSize: 13 }}>
            <b>How a cycle works:</b> for each property × month, BillBee tracks the billing day, drafts, posted bills, and payments. Click <b>open cycle →</b> to see all bills in that cycle with bulk actions.
          </Box>
        </main>
      </div>
    </div>
  </div>
);

window.V2_BillingCycles = V2_BillingCycles;
