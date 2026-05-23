// v2 Tenants — table list (v1 style). Click row → /tenants/:id (master-detail) — see tenant-detail.jsx.

const V2_tenantsData = [
  { name: "Joseph Cruz", room: "A-101", prop: "Sunset", phone: "0917-555-0011", email: "jcruz@mail.com", moveIn: "Jan 2024", status: "active" },
  { name: "Rico Lim", room: "A-101", prop: "Sunset", phone: "0917-555-0099", email: "rico@mail.com", moveIn: "Oct 2024", status: "active" },
  { name: "Ana Tan", room: "A-102", prop: "Sunset", phone: "0917-555-0034", email: "—", moveIn: "Mar 2025", status: "active", noEmail: true },
  { name: "Maria Reyes", room: "—", prop: "Sunset", phone: "0917-555-0088", email: "maria@mail.com", moveIn: "Feb 2023", moveOut: "Mar 1, 2026", status: "moved" },
  { name: "Diego Cruz", room: "A-104", prop: "Sunset", phone: "0917-555-0210", email: "diego@mail.com", moveIn: "Jul 2024", status: "active" },
  { name: "Liza Yu", room: "A-104", prop: "Sunset", phone: "0917-555-0444", email: "liza@mail.com", moveIn: "Aug 2025", status: "active" },
  { name: "Bryan So", room: "B-201", prop: "Sunset", phone: "0917-555-0501", email: "bryan@mail.com", moveIn: "Dec 2024", status: "active" },
  { name: "Carla Mendez", room: "B-203", prop: "Sunset", phone: "0917-555-0622", email: "—", moveIn: "Nov 2024", status: "active", noEmail: true },
  { name: "Patrick Reyes", room: "B-203", prop: "Sunset", phone: "0917-555-0911", email: "pat@mail.com", moveIn: "Jan 2025", status: "active" },
  { name: "Erika Ong", room: "B-204", prop: "Sunset", phone: "0917-555-0701", email: "erika@mail.com", moveIn: "Sep 2024", status: "active" },
];

const V2_Tenants = () => (
  <div className="screen">
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots"><span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" /></div>
        <span className="frame-url">billbee.app/tenants</span>
      </div>
      <div className="frame-body">
        <SideNavV2 active="tenants" />
        <main className="app-main">
          <div className="page-head">
            <div>
              <div className="crumbs">tenants &amp; occupancy</div>
              <h1>Tenants</h1>
              <div className="subtitle">{V2_tenantsData.length} records · {V2_tenantsData.filter(t => t.status === "active").length} active · {V2_tenantsData.filter(t => t.status === "moved").length} moved out</div>
            </div>
            <div className="row">
              <Btn ghost>⤓ Export</Btn>
              <Btn ghost>⤒ Import CSV</Btn>
              <Btn primary>＋ Add Tenant</Btn>
            </div>
          </div>

          <div className="row gap-lg mb-12">
            <div className="search mono" style={{ fontSize: 12.5 }}>⌕ name or phone…</div>
            <Btn sm ghost>property: all ▾</Btn>
            <Btn sm ghost>room: all ▾</Btn>
            <Btn sm ghost>status: active</Btn>
            <Btn sm ghost>missing email</Btn>
            <span className="grow" />
            <span className="muted" style={{ fontSize: 13 }}>{V2_tenantsData.length} results</span>
          </div>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table className="sk-table">
              <thead><tr><th><input type="checkbox" /></th><th>Tenant</th><th>Property · Room</th><th>Phone</th><th>Email</th><th>Move-in</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {V2_tenantsData.map((t) => (
                  <tr key={t.name} style={{ cursor: "pointer" }}>
                    <td><input type="checkbox" /></td>
                    <td><b>{t.name}</b></td>
                    <td><span className="soft">{t.prop} · </span><span className="mono">{t.room}</span></td>
                    <td className="mono">{t.phone}</td>
                    <td>
                      {t.noEmail
                        ? <Tag kind="warn">missing</Tag>
                        : <span className="mono" style={{ fontSize: 12 }}>{t.email}</span>}
                    </td>
                    <td className="soft">{t.moveIn}{t.moveOut ? ` → ${t.moveOut}` : ""}</td>
                    <td><Tag kind={t.status === "moved" ? "void" : t.status}>{t.status === "moved" ? "moved out" : t.status}</Tag></td>
                    <td><Btn sm ghost>open →</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="row between mt-12" style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
            <span>showing 1–{V2_tenantsData.length} of {V2_tenantsData.length}</span>
            <span className="mono">‹ 1 ›</span>
          </div>

          <Callout info className="mt-16">
            Click any row to open the tenant's detail page at <span className="mono">/tenants/:id</span> — uses the master-detail layout with charges attached, billing history, and move-out / transfer flows.
          </Callout>
        </main>
      </div>
    </div>
  </div>
);

window.V2_Tenants = V2_Tenants;
