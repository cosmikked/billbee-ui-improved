// v2 Payment Inline — payment + advance recorded directly on the bill detail page. Spec drawer is the fallback.

const V2_PaymentInline = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/billing/posted/BILL-26-00041/record-payment</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="billing" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">posted · BILL-26-00041 · record payment</div>
              <h1>Record payment</h1>
              <div className="subtitle">in-context on the bill · regular or advance</div>
            </div>
            <Btn ghost>cancel</Btn>
          </div>

          <div className="split-canvas">
            {/* REGULAR PAYMENT */}
            <div style={{ flex: "1 1 420px", minWidth: 380 }}>
              <div className="caption"><span className="arrow">→</span> Regular payment</div>
              <Card>
                <div className="row between mb-8">
                  <div>
                    <b className="marker" style={{ fontSize: 20 }}>BILL-26-00041</b>
                    <div className="muted">J. Cruz · Mar 2026</div>
                  </div>
                  <Tag kind="posted">posted</Tag>
                </div>

                <Box soft>
                  <div className="row between"><span className="muted">Balance</span><Money value="4,250" big /></div>
                  <div className="row between"><span className="muted">Due date</span><span>Mar 15, 2026</span></div>
                </Box>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <Field label="Amount" required>
                    <div className="sk-input mono"><b>₱ 4,250</b></div>
                  </Field>
                  <Field label="Date" required><Input value="Mar 9, 2026" mono /></Field>
                  <Field label="Receipt #" required hint="must be unique"><Input value="RCT-0183" mono /></Field>
                  <Field label="Mode" required>
                    <div className="row" style={{ flexWrap: "wrap", gap: 4 }}>
                      <Tag kind="active">cash</Tag><Tag>bank</Tag><Tag>e-wallet</Tag><Tag>other</Tag>
                    </div>
                  </Field>
                </div>

                {/* quick fill chips */}
                <div className="row mt-8" style={{ flexWrap: "wrap", gap: 6 }}>
                  <span className="muted" style={{ fontSize: 12 }}>quick:</span>
                  <Btn sm>full ₱4,250</Btn>
                  <Btn sm>half ₱2,125</Btn>
                  <Btn sm>round ₱4,000</Btn>
                  <Btn sm ghost>custom</Btn>
                </div>

                <Field label="Reference #" hint="optional · txn id"><Input placeholder="…" mono /></Field>
                <Field label="Proof of payment"><Box dashed style={{ textAlign: "center", padding: 14 }}>⤓ drop file or browse</Box></Field>
                <Field label="Notes"><Input placeholder="optional" /></Field>

                <Callout info className="mt-12">
                  ✓ exact balance → bill becomes <Tag kind="paid">paid</Tag>, receipt generated.
                </Callout>

                <Btn primary className="mt-12" style={{ width: "100%" }}>Record &amp; generate receipt</Btn>
              </Card>
            </div>

            {/* ADVANCE PAYMENT */}
            <div style={{ flex: "1 1 420px", minWidth: 380 }}>
              <div className="caption"><span className="arrow">→</span> Advance payment (future period)</div>
              <Card>
                <div className="row between mb-8">
                  <b className="marker" style={{ fontSize: 20 }}>Advance · J. Cruz</b>
                  <Tag kind="accent">future</Tag>
                </div>

                <Field label="Future billing period" required>
                  <div className="row" style={{ gap: 4 }}>
                    <Tag>Apr 2026</Tag>
                    <Tag kind="active">May 2026 ✓</Tag>
                    <Tag>Jun 2026</Tag>
                  </div>
                </Field>

                <Box soft>
                  <div className="row between"><span className="muted">Monthly rent (share)</span><span className="mono">₱3,000</span></div>
                  <div className="row between"><span className="muted">+ Fixed room charges</span><span className="mono">₱100</span></div>
                  <div className="row between"><span className="muted">+ Fixed tenant charges</span><span className="mono">₱700</span></div>
                  <div style={{ borderTop: "1.5px dashed var(--line-soft)", margin: "6px 0" }} />
                  <div className="row between"><b>Max advance for May</b><b className="mono">₱3,800</b></div>
                </Box>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <Field label="Amount" required hint="≤ max above"><Input value="₱3,800" mono /></Field>
                  <Field label="Date" required><Input value="Mar 9, 2026" mono /></Field>
                  <Field label="Receipt #" required><Input value="ADV-0042" mono /></Field>
                  <Field label="Mode" required><Input value="bank xfer" /></Field>
                </div>

                <Callout warn className="mt-12">
                  <b>Note:</b> Advance covers rent + fixed only. Water, electricity, penalties still appear on the May bill.
                </Callout>

                <Btn primary className="mt-12" style={{ width: "100%" }}>Record advance &amp; generate receipt</Btn>
              </Card>
            </div>
          </div>

          {/* Blocking states */}
          <div className="marker mt-24 mb-8" style={{ fontSize: 20 }}>Blocking states</div>
          <div className="split-canvas">
            <Card style={{ width: 320, flexShrink: 0 }}>
              <b>Overpayment blocked</b>
              <Callout warn className="mt-8" style={{ fontSize: 12.5 }}>
                Amount <b className="mono">₱5,000</b> exceeds balance <b className="mono">₱4,250</b>.<br />
                BillBee doesn't support overpayment credits. Record the excess as an <b>advance</b> for a future period.
              </Callout>
            </Card>
            <Card style={{ width: 320, flexShrink: 0 }}>
              <b>Already advance-paid</b>
              <Callout warn className="mt-8" style={{ fontSize: 12.5 }}>
                J. Cruz already fully advance-paid May 2026 rent + fixed.<br />
                Pick another period or record a regular payment instead.
              </Callout>
            </Card>
            <Card style={{ width: 320, flexShrink: 0 }}>
              <b>Tenant moved out</b>
              <Callout warn className="mt-8" style={{ fontSize: 12.5 }}>
                Tenant is moved out before May 2026 starts. Advance payment for this period is blocked.
              </Callout>
            </Card>
          </div>
        </main>
      </div>
    </div>
  </div>
);

window.V2_PaymentInline = V2_PaymentInline;
