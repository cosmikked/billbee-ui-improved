// v2 Rooms — split master/detail with rent-share preview + NEW: charges attached at room creation.

const V2_roomData = [
  { name: "A-101", cap: 2, occ: 2, rent: "₱6,000", mode: "Total/split", status: "active" },
  { name: "A-102", cap: 1, occ: 1, rent: "₱4,500", mode: "Per-tenant", status: "active" },
  { name: "A-103", cap: 2, occ: 0, rent: "₱6,000", mode: "Total/split", status: "active" },
  { name: "A-104", cap: 3, occ: 2, rent: "₱8,000", mode: "Per-tenant", status: "active" },
  { name: "B-201", cap: 4, occ: 3, rent: "₱9,000", mode: "Total/split", status: "active" },
  { name: "B-202", cap: 2, occ: 0, rent: "—", mode: "—", status: "maintenance" },
  { name: "B-203", cap: 2, occ: 2, rent: "₱6,500", mode: "Total/split", status: "active" },
  { name: "B-204", cap: 2, occ: 2, rent: "₱6,500", mode: "Total/split", status: "active" },
];

const V2_Rooms = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/rooms/A-101</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="rooms" />
        <main className="app-main" style={{ display: "flex", gap: 14, padding: "22px 22px 0 22px" }}>
          {/* master list */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <div className="row between mb-12">
              <h1 style={{ fontSize: 20 }}>Rooms</h1>
              <Btn primary sm>＋</Btn>
            </div>
            <div className="row gap-lg mb-12" style={{ flexWrap: "wrap", gap: 4 }}>
              <Btn sm ghost style={{ fontSize: 11, padding: "2px 8px" }}>property: Sunset ▾</Btn>
            </div>
            <div className="search mono mb-12" style={{ fontSize: 12 }}>⌕ search…</div>
            <div className="col" style={{ gap: 4 }}>
              {V2_roomData.map((r, i) => (
                <div key={r.name} className="sk-box" style={{
                  padding: 8, cursor: "pointer",
                  background: i === 0 ? "var(--ink)" : "var(--paper)",
                  color: i === 0 ? "var(--paper)" : "var(--ink)",
                }}>
                  <div className="row between">
                    <b className="mono">{r.name}</b>
                    <span className="mono" style={{ fontSize: 11 }}>{r.occ}/{r.cap}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.75 }}>{r.rent} · {r.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* detail / edit pane */}
          <div className="grow" style={{ borderLeft: "1.5px solid var(--line-soft)", paddingLeft: 18, minWidth: 0 }}>
            <div className="row between mb-12">
              <div>
                <div className="crumbs">sunset · rooms · A-101</div>
                <h1 style={{ fontSize: 28 }}>Room A-101</h1>
                <Tag kind="active">active</Tag>
              </div>
              <div className="row">
                <Btn sm ghost>change status</Btn>
                <Btn sm primary>save</Btn>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* LEFT column: basic fields + the NEW charges-attached picker */}
              <div>
                <Card style={{ padding: 14, marginBottom: 12 }}>
                  <b className="marker mb-8">Room basics</b>
                  <Field label="Room name/number" required><Input value="A-101" mono /></Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Capacity" required hint="≥ active tenants"><Input value="2" mono /></Field>
                    <Field label="Monthly rent" required><Input value="₱6,000" mono /></Field>
                  </div>
                  <Field label="Rent mode" required>
                    <div className="row">
                      <Tag kind="active">Room Total (split)</Tag>
                      <Tag>Per-Tenant</Tag>
                    </div>
                  </Field>
                  <Field label="Notes"><Input placeholder="optional" /></Field>
                </Card>

                {/* NEW: charges attached at room level */}
                <Card style={{ padding: 14, borderColor: "var(--accent)" }}>
                  <div className="row between mb-8">
                    <b className="marker" style={{ fontSize: 18 }}>Charges attached to this room</b>
                    <Btn sm ghost>＋ from catalog</Btn>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
                    Room-level &amp; Room-fixed scope only. Tenant-level charges (e.g. Parking) attach per-tenant instead.
                  </div>

                  <div className="col" style={{ gap: 6 }}>
                    <div className="sk-box row between" style={{ padding: 8 }}>
                      <div>
                        <b>Water</b> <Tag kind="warn" style={{ marginLeft: 4 }}>non-fixed</Tag>
                        <div className="muted" style={{ fontSize: 11.5 }}>room-level · amount via CSV</div>
                      </div>
                      <Btn sm ghost>✕</Btn>
                    </div>
                    <div className="sk-box row between" style={{ padding: 8 }}>
                      <div>
                        <b>Electricity</b> <Tag kind="warn" style={{ marginLeft: 4 }}>non-fixed</Tag>
                        <div className="muted" style={{ fontSize: 11.5 }}>room-level · amount via CSV</div>
                      </div>
                      <Btn sm ghost>✕</Btn>
                    </div>
                    <div className="sk-box row between" style={{ padding: 8 }}>
                      <div>
                        <b>Wi-Fi Fee</b> <Tag kind="active" style={{ marginLeft: 4 }}>fixed</Tag>
                        <div className="muted" style={{ fontSize: 11.5 }}>room-fixed · ₱200/mo · split ÷ occupants</div>
                      </div>
                      <Btn sm ghost>✕</Btn>
                    </div>
                  </div>

                  <Box dashed className="mt-8" style={{ padding: 8, fontSize: 12.5 }}>
                    Available to add: <span className="mono">Common Area Cleaning</span> · <span className="mono">Building Maintenance</span>
                  </Box>
                </Card>
              </div>

              {/* RIGHT column: occupants + rent share + room charges share preview */}
              <div>
                <Box soft>
                  <b className="marker">Current tenants (2 of 2)</b>
                  <ul style={{ margin: "6px 0 0 18px", fontSize: 13.5 }}>
                    <li>Joseph Cruz · move-in Jan 2024</li>
                    <li>Rico Lim · move-in Oct 2024</li>
                  </ul>
                </Box>

                <Card className="mt-12" style={{ padding: 12 }}>
                  <b className="marker">Per-tenant math preview</b>
                  <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>
                    What each active tenant pays from THIS room (excluding their personal charges)
                  </div>
                  <table className="sk-table" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td>Rent share (₱6,000 ÷ 2)</td><td className="num mono">₱3,000</td></tr>
                      <tr><td>Wi-Fi share (₱200 ÷ 2)</td><td className="num mono">₱100</td></tr>
                      <tr className="muted"><td>Water share (depends on CSV)</td><td className="num mono">~₱150</td></tr>
                      <tr className="muted"><td>Electricity share (depends on CSV)</td><td className="num mono">~₱400</td></tr>
                      <tr style={{ background: "var(--paper-2)" }}>
                        <td><b>Subtotal from room</b></td>
                        <td className="num"><b className="mono">₱3,650</b></td>
                      </tr>
                    </tbody>
                  </table>
                  <Callout info style={{ fontSize: 12.5, marginTop: 8 }}>
                    Tenant-specific charges (e.g. Parking, Laptop fee) added on top per tenant. If a tenant moves out mid-period, shares recalc on bill regeneration.
                  </Callout>
                </Card>

                <Btn className="mt-16" danger>Mark as Maintenance</Btn>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <Callout info className="mt-16">
      <b>NEW in v2:</b> charges can be attached directly to a room (room-level &amp; room-fixed scope). Saves you from attaching water/electricity to every tenant individually — it stays room-scoped, gets split by occupants.
    </Callout>
  </div>
);

window.V2_Rooms = V2_Rooms;
