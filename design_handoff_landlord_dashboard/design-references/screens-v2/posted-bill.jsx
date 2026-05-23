// v2 Posted Bill + Bulk Email — combined. Top: single bill detail. Bottom: bulk email composer (reached via "Send notices" button).

const V2_PostedBill = () => {
  const [view, setView] = React.useState("detail");
  return (
    <div className="screen">
      {/* Toggle between the two combined views */}
      <div className="row mb-12" style={{ gap: 6 }}>
        <button className={`var-tab ${view === "detail" ? "active" : ""}`} onClick={() => setView("detail")}>
          <span className="num">A</span><span>Single bill detail</span>
        </button>
        <button className={`var-tab ${view === "bulk" ? "active" : ""}`} onClick={() => setView("bulk")}>
          <span className="num">B</span><span>Bulk email composer</span>
        </button>
        <span className="muted" style={{ fontSize: 13, marginLeft: 8, alignSelf: "center" }}>
          (combined in v2 — same screen group, two surfaces)
        </span>
      </div>

      {view === "detail" ? <V2_PostedBillDetail /> : <V2_BulkEmail />}
    </div>
  );
};

const V2_PostedBillDetail = () => (
  <div className="frame">
    <div className="frame-bar">
      <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
      <span className="frame-url">billbee.app/billing/posted/BILL-26-00041</span>
    </div>
    <div className="frame-body">
      <SideNavV2 active="billing" />
      <main className="app-main">
        <div className="page-head">
          <div>
            <div className="crumbs">billing · cycles · sunset · mar 2026 · BILL-26-00041</div>
            <h1>Bill <span className="mono" style={{ color: "var(--ink-muted)" }}>· BILL-26-00041</span></h1>
            <div className="row" style={{ gap: 8 }}>
              <Tag kind="posted">posted</Tag>
              <span className="muted">J. Cruz · A-101 · period Mar 2026 · due Mar 15</span>
            </div>
          </div>
          <div className="row">
            <Btn ghost>← prev</Btn>
            <Btn ghost>next →</Btn>
            <Btn ghost>⤓ PDF</Btn>
            <Btn ghost>🖨 print</Btn>
            <Btn ghost danger>void</Btn>
            <Btn primary>✉ Send notice</Btn>
          </div>
        </div>

        <Callout info>
          <b>Email notice:</b> <Tag kind="warn">Pending</Tag> queued at 14:08 · last attempt — · <Btn sm ghost>view email log</Btn>
          <span className="grow" />
          <Btn sm>↻ Send to all unsent in this cycle (5)</Btn>
        </Callout>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginTop: 14 }}>
          <Card>
            <div className="row between mb-8">
              <b className="marker" style={{ fontSize: 22 }}>Bill statement</b>
              <span className="muted mono" style={{ fontSize: 12 }}>generated Mar 9 · invoice locked</span>
            </div>
            <table className="sk-table">
              <thead><tr><th>Line</th><th>Source</th><th>Detail</th><th className="num">Amount</th></tr></thead>
              <tbody>
                <tr><td><b>Rent share</b></td><td className="mono soft">room</td><td className="soft">A-101 ₱6,000 ÷ 2</td><td className="num mono">₱3,000</td></tr>
                <tr><td><b>Wi-Fi share</b></td><td className="mono soft">room</td><td className="soft">₱200 ÷ 2</td><td className="num mono">₱100</td></tr>
                <tr><td><b>Water share</b></td><td className="mono soft">room·csv</td><td className="soft">₱300 ÷ 2</td><td className="num mono">₱150</td></tr>
                <tr><td><b>Elec. share</b></td><td className="mono soft">room·csv</td><td className="soft">₱800 ÷ 2</td><td className="num mono">₱400</td></tr>
                <tr><td><b>Parking Fee</b></td><td className="mono soft">tenant</td><td className="soft">fixed</td><td className="num mono">₱500</td></tr>
                <tr><td><b>Laptop fee</b></td><td className="mono soft">tenant</td><td className="soft">tenant-specific</td><td className="num mono">₱100</td></tr>
                <tr style={{ background: "var(--paper-2)" }}>
                  <td colSpan="3"><b>Total amount due</b></td>
                  <td className="num"><Money value="4,250" big /></td>
                </tr>
                <tr>
                  <td colSpan="3"><span className="muted">Paid so far</span></td>
                  <td className="num mono">₱0</td>
                </tr>
                <tr>
                  <td colSpan="3"><b>Current balance</b></td>
                  <td className="num mono" style={{ color: "var(--accent)" }}><b>₱4,250</b></td>
                </tr>
              </tbody>
            </table>

            <div className="row mt-16">
              <Btn primary>＋ Record payment</Btn>
              <Btn ghost>＋ Record advance</Btn>
              <span className="grow" />
              <Btn ghost sm>view PDF preview ↗</Btn>
            </div>
          </Card>

          <div className="col">
            <Card>
              <b className="marker">Activity</b>
              <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none", fontSize: 13 }}>
                <li style={{ padding: "5px 0", borderBottom: "1px dashed var(--line-soft)" }}>
                  <span className="mono soft" style={{ fontSize: 11 }}>Mar 9 · 06:14p</span><br />Posted by Maria
                </li>
                <li style={{ padding: "5px 0", borderBottom: "1px dashed var(--line-soft)" }}>
                  <span className="mono soft" style={{ fontSize: 11 }}>Mar 9 · 02:08p</span><br />Email notice queued
                </li>
                <li style={{ padding: "5px 0" }}>
                  <span className="mono soft" style={{ fontSize: 11 }}>Mar 8 · 11:50a</span><br />Draft generated from CSV
                </li>
              </ul>
            </Card>
            <Box hl>
              <b>Void rules</b>
              <ul style={{ margin: "4px 0 0 16px", fontSize: 12.5 }}>
                <li>Must enter a reason</li>
                <li>Cannot void if payments exist — void payments first</li>
                <li>Void bills stay visible in history</li>
              </ul>
            </Box>
          </div>
        </div>
      </main>
    </div>
  </div>
);

const V2_BulkEmail = () => (
  <div className="frame">
    <div className="frame-bar">
      <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
      <span className="frame-url">billbee.app/billing/cycles/sunset-2026-03/email</span>
    </div>
    <div className="frame-body">
      <SideNavV2 active="billing" />
      <main className="app-main">
        <div className="page-head">
          <div>
            <div className="crumbs">cycles · sunset · mar 2026 · send notices</div>
            <h1>Send bill notices</h1>
            <div className="subtitle">Mar 2026 · Sunset Apartments · 8 posted bills</div>
          </div>
          <div className="row">
            <Btn>cancel</Btn>
            <Btn primary>Send 6 notices →</Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
          <Card>
            <div className="row between mb-8">
              <b className="marker" style={{ fontSize: 22 }}>Recipients</b>
              <div className="row">
                <Btn sm ghost>select all not-sent</Btn>
                <Btn sm ghost>invert</Btn>
              </div>
            </div>
            <table className="sk-table">
              <thead><tr><th>✓</th><th>Bill #</th><th>Tenant</th><th>Email</th><th>Last sent</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  ["BILL-26-00041", "J. Cruz", "jcruz@mail.com", "—", "not sent", true],
                  ["BILL-26-00040", "R. Lim", "rico@mail.com", "Mar 9", "sent", false],
                  ["BILL-26-00039", "A. Tan", "—", "—", "no email", false, "warn"],
                  ["BILL-26-00038", "D. Cruz", "diego@mail.com", "—", "not sent", true],
                  ["BILL-26-00037", "L. Yu", "liza@mail.com", "Mar 9", "failed", true, "fail"],
                  ["BILL-26-00036", "B. So", "bryan@mail.com", "—", "not sent", true],
                ].map(([id, t, e, last, st, on, k]) => (
                  <tr key={id} style={{ opacity: k === "warn" ? 0.6 : 1 }}>
                    <td><input type="checkbox" defaultChecked={on} disabled={k === "warn"} /></td>
                    <td className="mono">{id}</td>
                    <td>{t}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{e}</td>
                    <td className="mono soft">{last}</td>
                    <td>
                      <Tag kind={st === "sent" ? "paid" : st === "failed" ? "overdue" : st === "no email" ? "warn" : "draft"}>{st}</Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Callout warn className="mt-12">
              <b>1 tenant skipped:</b> A. Tan has no email. <a href="#" style={{ color: "var(--accent)" }}>add email →</a><br />
              Bulk Send skips Paid, Void, and Pending bills automatically.
            </Callout>
          </Card>

          <div className="col">
            <Card>
              <b className="marker">Message template</b>
              <Field label="Subject"><Input value="Your March 2026 bill — Sunset Apartments" /></Field>
              <Field label="Body" hint="auto-fills {{tenant}}, {{period}}, {{total}}, {{due_date}}">
                <Box soft style={{ fontSize: 12.5, lineHeight: 1.5, padding: 10 }}>
                  Hi {"{{tenant}}"},<br /><br />
                  Your bill for {"{{period}}"} is ready. Total due is <b>{"{{total}}"}</b>, payable by {"{{due_date}}"}.<br /><br />
                  Statement attached as PDF.<br /><br />
                  Thanks,<br />Maria
                </Box>
              </Field>
              <Field label="Attach"><div className="row" style={{ gap: 6 }}><Tag kind="active">PDF statement ✓</Tag><Tag>QR pay code</Tag></div></Field>
            </Card>

            <Box hl>
              <b>Summary</b>
              <div style={{ fontSize: 13, marginTop: 6 }}>
                <div className="row between"><span>Selected</span><b className="mono">4</b></div>
                <div className="row between"><span>Skipped (no email)</span><b className="mono">1</b></div>
                <div className="row between"><span>Skipped (already sent)</span><b className="mono">1</b></div>
                <div className="row between"><span>Failed last time → retry</span><b className="mono">1</b></div>
              </div>
            </Box>
          </div>
        </div>
      </main>
    </div>
  </div>
);

window.V2_PostedBill = V2_PostedBill;
