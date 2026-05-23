// v2 Payments & Receipts — MERGED page. One row per payment with both payment + receipt columns.
// Click a row → side preview shows payment record (left) + receipt PDF preview (right).

const V2_payments = [
  { date: "Mar 9", tenant: "J. Cruz",  bill: "BILL-26-00041", amount: "₱4,350", mode: "cash",     rcpt: "RCT-0183", email: "sent",     status: "active" },
  { date: "Mar 9", tenant: "J. Cruz",  bill: "ADV-May2026",   amount: "₱3,800", mode: "bank",     rcpt: "ADV-0042", email: "not sent", status: "active", adv: true },
  { date: "Mar 8", tenant: "R. Lim",   bill: "BILL-26-00040", amount: "₱3,000", mode: "bank",     rcpt: "RCT-0182", email: "sent",     status: "active" },
  { date: "Mar 7", tenant: "A. Tan",   bill: "BILL-26-00039", amount: "₱5,900", mode: "e-wallet", rcpt: "RCT-0181", email: "failed",   status: "active" },
  { date: "Feb 28", tenant: "M. Reyes", bill: "BILL-25-00498", amount: "₱4,100", mode: "cash",    rcpt: "RCT-0179", email: "sent",     status: "void" },
  { date: "Feb 28", tenant: "J. Cruz", bill: "BILL-26-00033", amount: "₱3,750", mode: "cash",     rcpt: "RCT-0178", email: "sent",     status: "active" },
];

const V2_PaymentsReceipts = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/payments</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="payments" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">payments &amp; receipts</div>
              <h1>Payments &amp; Receipts</h1>
              <div className="subtitle">audit list of every recorded payment + the receipt it generated · 1 row per payment</div>
            </div>
            <div className="row">
              <Btn ghost>⤓ Export</Btn>
              <Btn ghost>↻ Resend failed (1)</Btn>
              <Btn primary>＋ Record payment</Btn>
            </div>
          </div>

          <div className="row gap-lg mb-12">
            <div className="search mono" style={{ fontSize: 12.5 }}>⌕ receipt #, bill #, tenant…</div>
            <Btn sm ghost>date: last 30d ▾</Btn>
            <Btn sm ghost>property: all</Btn>
            <Btn sm ghost>mode: any</Btn>
            <Btn sm ghost>type: regular + advance</Btn>
            <Btn sm ghost>email: any</Btn>
            <Btn sm ghost>status: active</Btn>
            <span className="grow" />
            <span className="muted" style={{ fontSize: 13 }}>6 results</span>
          </div>

          <Callout info className="mb-12">
            <b>Recording happens on the bill</b> — open any posted bill and use the inline Record Payment form. This page is for <b>audit + export</b>.
          </Callout>

          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14 }}>
            {/* merged table — one row per payment, both payment + receipt columns */}
            <Card style={{ padding: 0 }}>
              <table className="sk-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Tenant</th><th>Bill #</th>
                    <th className="num">Amount</th><th>Mode</th>
                    <th>Receipt #</th><th>Email</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {V2_payments.map((p, i) => (
                    <tr key={p.rcpt} style={{
                      opacity: p.status === "void" ? 0.55 : 1,
                      background: i === 0 ? "rgba(232,90,26,0.06)" : undefined,
                      cursor: "pointer",
                    }}>
                      <td className="mono">{p.date}</td>
                      <td>{p.tenant}</td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        {p.bill}
                        {p.adv && <Tag kind="accent" style={{ marginLeft: 4, fontSize: 9 }}>advance</Tag>}
                      </td>
                      <td className="num mono"><b>{p.amount}</b></td>
                      <td>{p.mode}</td>
                      <td className="mono">{p.rcpt}</td>
                      <td>
                        <Tag kind={p.email === "sent" ? "paid" : p.email === "failed" ? "overdue" : "draft"}>
                          {p.email}
                        </Tag>
                      </td>
                      <td><Tag kind={p.status}>{p.status}</Tag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* selected row preview — both payment record + receipt PDF */}
            <div className="col">
              <Card style={{ padding: 12 }}>
                <div className="row between mb-8">
                  <b className="marker" style={{ fontSize: 18 }}>Payment record</b>
                  <Btn sm ghost>open bill →</Btn>
                </div>
                <div style={{ fontSize: 13 }}>
                  <div className="row between"><span className="muted">Date</span><b className="mono">Mar 9, 2026</b></div>
                  <div className="row between"><span className="muted">Tenant</span><b>Joseph Cruz</b></div>
                  <div className="row between"><span className="muted">Bill #</span><span className="mono">BILL-26-00041</span></div>
                  <div className="row between"><span className="muted">Amount</span><b className="mono">₱4,350</b></div>
                  <div className="row between"><span className="muted">Mode</span><span>Cash</span></div>
                  <div className="row between"><span className="muted">Reference</span><span className="mono soft">—</span></div>
                  <div className="row between"><span className="muted">Recorded by</span><span>Maria</span></div>
                  <div className="row between"><span className="muted">Proof</span><Btn sm ghost>view ↗</Btn></div>
                </div>
                <Btn sm danger ghost className="mt-8" style={{ width: "100%" }}>Void payment</Btn>
              </Card>

              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ background: "var(--paper-2)", padding: "8px 12px", borderBottom: "1.5px solid var(--line-soft)" }}>
                  <div className="row between">
                    <b className="marker">Receipt RCT-0183</b>
                    <div className="row" style={{ gap: 4 }}>
                      <Btn sm ghost>⤓</Btn><Btn sm ghost>🖨</Btn><Btn sm ghost>✉</Btn>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 14, fontSize: 12.5 }}>
                  <div className="row between mb-4">
                    <b className="marker" style={{ fontSize: 18 }}>● BillBee Receipt</b>
                    <div className="mono" style={{ fontSize: 10, textAlign: "right" }}>RCT-0183<br />Mar 9, 2026</div>
                  </div>
                  <div className="muted" style={{ fontSize: 11 }}>Sunset Apartments</div>
                  <div style={{ borderTop: "1.5px dashed var(--line-soft)", margin: "8px 0" }} />
                  <div className="row between"><span className="muted">From</span><b>Joseph Cruz</b></div>
                  <div className="row between"><span className="muted">For bill</span><span className="mono">BILL-26-00041</span></div>
                  <div className="row between"><span className="muted">Period</span><span>March 2026</span></div>
                  <div className="row between"><span className="muted">Mode</span><span>Cash</span></div>
                  <div style={{ borderTop: "1.5px solid var(--line)", margin: "8px 0" }} />
                  <div className="row between"><b>Amount paid</b><Money value="4,350" big /></div>
                  <div className="muted mt-8" style={{ fontSize: 10.5 }}>
                    Bill balance after: ₱0 · marked Paid<br />
                    Issued by Maria · billbee.app
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Void receipt example */}
          <div className="marker mt-24 mb-8" style={{ fontSize: 20 }}>Void payment + receipt</div>
          <div className="split-canvas">
            <Card style={{ padding: 14, width: 320, flexShrink: 0 }}>
              <b className="marker" style={{ fontSize: 18 }}>Void payment</b>
              <Field label="Reason" required><Input placeholder="why are you voiding this?" /></Field>
              <Callout warn className="mt-8" style={{ fontSize: 12 }}>
                The linked receipt will be marked Void.<br />
                Bill balance will be restored.<br />
                Payment can't be voided twice.
              </Callout>
              <div className="row mt-8" style={{ justifyContent: "flex-end", gap: 6 }}>
                <Btn sm>Cancel</Btn>
                <Btn sm primary danger>Void</Btn>
              </div>
            </Card>

            <Card style={{ padding: 14, width: 320, flexShrink: 0, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-marker)", fontSize: 72, color: "rgba(192,57,43,0.18)",
                transform: "rotate(-18deg)", pointerEvents: "none",
              }}>VOID</div>
              <b className="marker" style={{ fontSize: 18 }}>● BillBee Receipt</b>
              <div className="muted mono" style={{ fontSize: 11 }}>RCT-0179 · Feb 28, 2026</div>
              <div style={{ borderTop: "1.5px dashed var(--line-soft)", margin: "8px 0" }} />
              <div className="row between" style={{ fontSize: 12.5 }}><span className="muted">From</span><b>Maria Reyes</b></div>
              <div className="row between" style={{ fontSize: 12.5 }}><span className="muted">Amount</span><span className="mono">₱4,100</span></div>
              <div className="row between" style={{ fontSize: 12.5 }}><span className="muted">Reason</span><span className="soft">wrong tenant</span></div>
              <Callout warn className="mt-8" style={{ fontSize: 12 }}>
                Void receipts stay visible. Cannot be emailed as active.
              </Callout>
            </Card>
          </div>
        </main>
      </div>
    </div>
  </div>
);

window.V2_PaymentsReceipts = V2_PaymentsReceipts;
