// Sketch primitives — small reusable building blocks for the wireframes.
// All exported to window at the end so other Babel scripts can use them.

const Btn = ({ children, primary, ghost, danger, sm, lg, className = "", ...rest }) => (
  <button
    className={[
      "sk-btn",
      primary && "primary",
      ghost && "ghost",
      danger && "danger",
      sm && "sm",
      lg && "lg",
      className,
    ].filter(Boolean).join(" ")}
    {...rest}
  >
    {children}
  </button>
);

const Tag = ({ children, kind = "" }) => (
  <span className={`sk-tag ${kind}`}>{children}</span>
);

const Box = ({ children, soft, hl, dashed, shadow, className = "", style }) => (
  <div
    className={[
      "sk-box",
      soft && "soft",
      hl && "hl",
      dashed && "dashed",
      shadow && "shadow",
      className,
    ].filter(Boolean).join(" ")}
    style={style}
  >
    {children}
  </div>
);

const Card = ({ children, className = "", style }) => (
  <div className={`sk-card ${className}`} style={style}>{children}</div>
);

const Scribble = ({ width = "long", thin }) => (
  <span className={`sk-scribble ${width} ${thin ? "thin" : ""}`} />
);

const Field = ({ label, required, children, hint }) => (
  <div className="sk-field">
    <label className="sk-label">
      {label} {required && <span className="req">*</span>}
    </label>
    {children}
    {hint && <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{hint}</div>}
  </div>
);

const Input = ({ value, placeholder, mono, ...rest }) => (
  <div className={`sk-input ${!value ? "empty" : ""}`} {...rest}>
    {value ? (
      <span className={mono ? "mono" : ""}>{value}</span>
    ) : (
      <span className="muted">{placeholder || "..."}</span>
    )}
  </div>
);

const Money = ({ value, big }) => (
  <span className="sk-money" style={big ? { fontSize: 22, fontWeight: 600 } : null}>
    ₱{value}
  </span>
);

const Callout = ({ children, warn, info }) => (
  <div className={`callout ${warn ? "warn" : ""} ${info ? "info" : ""}`}>{children}</div>
);

const Annot = ({ children }) => <span className="annot">{children}</span>;

const Stepper = ({ steps, current }) => (
  <div className="sk-stepper">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className={["sk-step", i < current && "done", i === current && "current"].filter(Boolean).join(" ")}>
          <span className="bub">{i < current ? "✓" : i + 1}</span>
          <span>{s}</span>
        </div>
        {i < steps.length - 1 && <span className="arrow mono">→</span>}
      </React.Fragment>
    ))}
  </div>
);

const VarNote = ({ label, children }) => (
  <div className="var-note">
    <span className="label">{label}</span>
    <span className="body">{children}</span>
  </div>
);

// Hand-drawn arrow SVG between elements
const Arrow = ({ length = 40, dir = "down" }) => {
  const rot = { down: 90, up: 270, right: 0, left: 180 }[dir] || 0;
  return (
    <svg width={length} height={20} viewBox={`0 0 ${length} 20`} style={{ transform: `rotate(${rot}deg)` }}>
      <path
        d={`M2 10 Q ${length / 2} 4 ${length - 6} 10`}
        stroke="var(--accent)" strokeWidth="1.5" fill="none"
      />
      <path
        d={`M${length - 10} 6 L ${length - 4} 10 L ${length - 10} 14`}
        stroke="var(--accent)" strokeWidth="1.5" fill="none"
      />
    </svg>
  );
};

// Legend block for status colors
const StatusLegend = () => (
  <div className="legend">
    <span className="item"><Tag kind="draft">Draft</Tag></span>
    <span className="item"><Tag kind="posted">Posted</Tag></span>
    <span className="item"><Tag kind="partial">Partial</Tag></span>
    <span className="item"><Tag kind="paid">Paid</Tag></span>
    <span className="item"><Tag kind="overdue">Overdue</Tag></span>
    <span className="item"><Tag kind="void">Void</Tag></span>
  </div>
);

Object.assign(window, {
  Btn, Tag, Box, Card, Scribble, Field, Input, Money,
  Callout, Annot, Stepper, VarNote, Arrow, StatusLegend,
});
