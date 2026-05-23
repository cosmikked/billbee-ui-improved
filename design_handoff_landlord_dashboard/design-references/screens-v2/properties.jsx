// v2 Properties — card grid; clicking "Open" goes to Property Hub.

const V2_propData = [
  { name: "Sunset Apartments", addr: "23 Pinewood St., Quezon City", day: 15, rooms: 8, occ: "11/14", status: "active", ready: true, collected: "₱28k" },
  { name: "Greenview Residences", addr: "Block 4, Lot 12, BF Homes", day: 5, rooms: 6, occ: "5/10", status: "active", ready: true, collected: "₱14k" },
  { name: "Old Riverside (legacy)", addr: "Riverside Rd., Marikina", day: 1, rooms: 4, occ: "0/8", status: "inactive", ready: false, collected: "—" },
];

const V2_Properties = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/properties</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="properties" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">properties</div>
              <h1>Properties</h1>
              <div className="subtitle">3 properties · 2 active · 1 inactive</div>
            </div>
            <div className="row">
              <Btn ghost>⤓ Export</Btn>
              <Btn primary>＋ Create Property</Btn>
            </div>
          </div>

          <div className="row gap-lg mb-16">
            <div className="search mono" style={{ fontSize: 12.5 }}>⌕ search…</div>
            <Btn sm ghost>status: any ▾</Btn>
            <span className="grow" />
            <span className="muted" style={{ fontSize: 13 }}>3 results</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {V2_propData.map((p, i) => (
              <Card key={p.name} className={`wobble-${(i % 3) + 1}`}>
                <div className="row between mb-8">
                  <Tag kind={p.status}>{p.status}</Tag>
                  <div className="row" style={{ gap: 4 }}>
                    {p.ready && <Tag kind="paid">ready to bill</Tag>}
                    <span className="muted mono" style={{ fontSize: 11 }}>day {p.day}</span>
                  </div>
                </div>
                <div className="marker" style={{ fontSize: 22, fontWeight: 700 }}>{p.name}</div>
                <div className="soft" style={{ fontSize: 13, marginBottom: 10 }}>{p.addr}</div>

                {/* sketch building */}
                <div style={{ height: 64, background: "var(--paper-2)", borderRadius: 8, border: "1.5px dashed var(--line-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <svg width="110" height="48" viewBox="0 0 110 48">
                    <path d="M5 44 L5 18 L40 18 L40 44 Z M40 44 L40 8 L75 8 L75 44 Z M75 44 L75 22 L105 22 L105 44 Z" stroke="var(--line-soft)" strokeWidth="1.5" fill="none" />
                    <g stroke="var(--line-soft)" strokeWidth="1">
                      <rect x="10" y="24" width="6" height="6" fill="none" /><rect x="22" y="24" width="6" height="6" fill="none" />
                      <rect x="46" y="16" width="6" height="6" fill="none" /><rect x="60" y="16" width="6" height="6" fill="none" />
                      <rect x="46" y="28" width="6" height="6" fill="none" /><rect x="60" y="28" width="6" height="6" fill="none" />
                      <rect x="82" y="28" width="6" height="6" fill="none" /><rect x="94" y="28" width="6" height="6" fill="none" />
                    </g>
                  </svg>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10, fontSize: 13 }}>
                  <div><div className="muted" style={{ fontSize: 11 }}>rooms</div><b>{p.rooms}</b></div>
                  <div><div className="muted" style={{ fontSize: 11 }}>occupied</div><b>{p.occ}</b></div>
                  <div><div className="muted" style={{ fontSize: 11 }}>this mo.</div><b className="mono">{p.collected}</b></div>
                </div>

                <div className="row">
                  <Btn sm primary className="grow">Open →</Btn>
                  <Btn sm ghost>⋯</Btn>
                </div>
              </Card>
            ))}
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="big">＋</div>
              <div>Create new property</div>
            </div>
          </div>

          <Callout info className="mt-24">
            <b>Tip:</b> click <b>Open →</b> on any property to enter its <b>Property Hub</b> — that's where you set up its charges, rooms, and tenants.
          </Callout>
        </main>
      </div>
    </div>
  </div>
);

window.V2_Properties = V2_Properties;
