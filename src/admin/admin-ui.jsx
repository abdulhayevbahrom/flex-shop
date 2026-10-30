import { useEffect, useId, useRef } from "react";

const paths = {
  package: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/></>,
  "credit-card": <><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20M6 15h3"/></>,
  orders: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/></>,
  chart: <><path d="M4 3v17h17M8 15l4-5 4 3 5-7"/></>,
  bot: <><rect x="3" y="7" width="18" height="14" rx="4"/><path d="M12 3v4M8 12v2M16 12v2M9 18h6M1 12h2M21 12h2"/></>,
  refresh: <><path d="M20 7a9 9 0 0 0-15-2L2 8M2 3v5h5M4 17a9 9 0 0 0 15 2l3-3M22 21v-5h-5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  pencil: <><path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6"/>,
  "arrow-left": <path d="M20 12H4m6-6-6 6 6 6"/>,
  "arrow-up-right": <path d="M6 18 18 6M6 6h12v12"/>,
  layers: <><path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  x: <path d="m6 6 12 12M6 18 18 6"/>,
  loader: <path d="M21 12a9 9 0 1 1-9-9"/>,
  search: <><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></>,
  wallet: <><path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6M20 12h-5v5h5"/><path d="M17 14.5h.01"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  hidden: <><path d="m3 3 18 18M10.6 5.1A12 12 0 0 1 12 5c6 0 10 7 10 7a21 21 0 0 1-3 3.7M6.3 6.3A22 22 0 0 0 2 12s4 7 10 7a13 13 0 0 0 5.7-1.3"/></>,
  logout: <><path d="M9 3H4v18h5M13 8l5 4-5 4M8 12h10"/></>,
  "chevron-right": <path d="m9 5 7 7-7 7"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
  copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,
  dollar: <><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  game: <><path d="M7 7h10a4 4 0 0 1 4 3l1 7a3 3 0 0 1-5 3l-3-3h-4l-3 3a3 3 0 0 1-5-3l1-7a4 4 0 0 1 4-3Z"/><path d="M8 10v6M5 13h6M16 12h.01M19 15h.01"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
  shield: <><path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/></>,
  alert: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
  power: <><path d="M12 2v10M6 5a9 9 0 1 0 12 0"/></>,
  contactless: <><path d="M6 8a8 8 0 0 1 0 8M10 5a12 12 0 0 1 0 14M14 2a17 17 0 0 1 0 20"/></>,
};

export function Icon({ name, size = 18, className = "", ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`ui-icon ${name === "loader" ? "spin" : ""} ${className}`} aria-hidden="true" {...props}>{paths[name] ?? paths.package}</svg>;
}

export function Toggle({ checked, onChange, disabled, label }) {
  return <button type="button" role="switch" aria-checked={!!checked} aria-label={label} className={`toggle ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)} disabled={disabled}><span /></button>;
}

export function PageTitle({ title, text, actions }) {
  return <header className="page-heading"><div><h1>{title}</h1>{text && <p>{text}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</header>;
}

export function EmptyState({ icon = "layers", title = "Ma’lumot topilmadi", text, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} size={22}/></span><strong>{title}</strong>{text && <p>{text}</p>}{action}</div>;
}

export function ErrorBox({ text, close }) {
  return <div className="admin-alert error" role="alert"><Icon name="alert" size={16}/><span>{text}</span>{close && <button type="button" className="icon-button" onClick={close} aria-label="Xabarni yopish"><Icon name="x" size={15}/></button>}</div>;
}

export function MetricCard({ label, value, hint, icon = "chart", tone = "blue" }) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon name={icon} size={17}/></span></div><strong className="metric-value">{value}</strong>{hint && <span className="metric-hint">{hint}</span>}</article>;
}

export function Modal({ title, subtitle, onClose, children, footer }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = ref.current;
    node?.focus();
    function keydown(event) {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab" || !node) return;
      const focusable = [...node.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]')];
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === node)) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); previousFocus?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section ref={ref} className="admin-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><header className="modal-header"><div><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" className="icon-button" aria-label="Oynani yopish" onClick={onClose}><Icon name="x"/></button></header><div className="modal-body">{children}</div>{footer && <footer className="modal-footer">{footer}</footer>}</section></div>;
}

export const money = (value) => `${Number(value || 0).toLocaleString("ru-RU")} so‘m`;
export const usd = (value) => `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
export const dateTime = (value) => value ? new Date(value).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
export const formatCardNumber = (value = "") => String(value).replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
