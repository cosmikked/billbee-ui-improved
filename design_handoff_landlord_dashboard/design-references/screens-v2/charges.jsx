// v2 Charges — table view, can be accessed top-level (all properties, filterable) or inside Property Hub.

const V2_chargesData = [
  { name: "Water", cat: "Water", type: "Non-fixed", scope: "Room-level", amt: "—", status: "active", rooms: "all 8" },
  { name: "Electricity", cat: "Electricity", type: "Non-fixed", scope: "Room-level", amt: "—", status: "active", rooms: "all 8" },
  { name: "Wi-Fi Fee", cat: "Other", type: "Fixed", scope: "Room-fixed", amt: "₱200", status: "active", rooms: "6 of 8" },
  { name: "Parking Fee", cat: "Parking", type: "Fixed", scope: "Tenant-level", amt: "₱500", status: "active", rooms: "—" },
  { name: "Pet Fee", cat: "Other", type: "Fixed", scope: "Tenant-level", amt: "₱200", status: "active", rooms: "—" },
  { name: "Laptop fee", cat: "Gadgets", type: "Tenant-specific", scope: "Tenant-level", amt: "₱100", status: "active", rooms: "—" },
  { name: "Old aircon surcharge", cat: "Appliances", type: "Fixed", scope: "Tenant-level", amt: "₱150", status: "inactive", rooms: "—" },
];

const V2_Charges = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/charges</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="charges" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">charge catalog</div>
              <h1>Charge Catalog</h1>
              <div className="subtitle">defines what <em>can</em> be billed — creating a charge does <b>not</b> bill tenants</div>
            </div>
            <div className="row">
              <select className="sk-btn" style={{ background: "var(--paper)" }}>
                <option>All properties</option>
                <option>Sunset Apartments</option>
                <option>Greenview Residences</option>
              </select>
              <Btn primary>＋ Add Charge</Btn>
            </div>
          </div>

          <Callout info>
            <b>How charges flow into bills:</b><br />
            <b>Room-level / Room-fixed</b> — picked when creating/editing a room → split among the room's active tenants.<br />
            <b>Tenant-level / Tenant-specific</b> — attached to individual tenants → billed directly to them.
          </Callout>

          <div className="row gap-lg mt-16 mb-12">
            <div className="search mono" style={{ fontSize: 12.5 }}>⌕ search charges…</div>
            <Btn sm ghost>property: Sunset Apts ▾</Btn>
            <Btn sm ghost>category: any ▾</Btn>
            <Btn sm ghost>type: any ▾</Btn>
            <Btn sm ghost>scope: any ▾</Btn>
            <Btn sm ghost>status: active</Btn>
            <span className="grow" />
            <span className="muted" style={{ fontSize: 13 }}>7 charges</span>
          </div>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table className="sk-table">
              <thead>
                <tr>
                  <th>Charge</th><th>Category</th><th>Type</th><th>Scope</th>
                  <th className="num">Default amount</th>
                  <th>Attached to rooms</th>
                  <th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {V2_chargesData.map((c) => (
                  <tr key={c.name}>
                    <td><b>{c.name}</b></td>
                    <td>{c.cat}</td>
                    <td>
                      <Tag kind={c.type === "Non-fixed" ? "warn" : c.type === "Tenant-specific" ? "accent" : ""}>
                        {c.type}
                      </Tag>
                    </td>
                    <td className="soft">{c.scope}</td>
                    <td className="num"><span className="mono">{c.amt}</span></td>
                    <td className="mono soft">{c.rooms}</td>
                    <td><Tag kind={c.status}>{c.status}</Tag></td>
                    <td className="row" style={{ gap: 4 }}>
                      <Btn sm ghost>edit</Btn>
                      <Btn sm ghost>⋯</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Box className="mt-16 hl" style={{ padding: 12 }}>
            <b className="marker">Rule reminder</b>
            <ul style={{ margin: "4px 0 0 18px", fontSize: 13.5 }}>
              <li><b>Fixed</b> charges need an amount; <b>Non-fixed</b> ones don't (entered via CSV at billing).</li>
              <li>Inactive charges stay visible in old bills but cannot be selected for new ones.</li>
              <li>Duplicate active charge names within the same property are blocked.</li>
              <li><b>Room-level/Room-fixed</b> charges show <span className="mono">"attached to rooms"</span> count — click a charge to manage which rooms include it.</li>
            </ul>
          </Box>
        </main>
      </div>
    </div>
  </div>
);

window.V2_Charges = V2_Charges;
