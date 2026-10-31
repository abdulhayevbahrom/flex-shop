import { useEffect, useMemo, useState } from "react";
import { adminApi } from "./adminApi";
import { EmptyState, ErrorBox, Icon, MetricCard, Modal, PageTitle, Toggle, money, usd } from "./admin-ui";
import PaymentCardsPage from "./PaymentCardsPage";
import OrdersPage from "./OrdersPage";
import StatisticsPage from "./StatisticsPage";
import "./admin.css";

const menu = [
  { id: "packages", icon: "package", label: "Paketlar", description: "Katalog va narxlar" },
  { id: "cards", icon: "credit-card", label: "To‘lov kartalari", short: "Kartalar", description: "To‘lov rekvizitlari" },
  { id: "orders", icon: "orders", label: "Zakazlar", description: "Barcha buyurtmalar" },
  { id: "statistics", icon: "chart", label: "Statistika", description: "Oylik hisobotlar" },
  { id: "bot", icon: "bot", label: "Bot boshqaruvi", short: "Bot", description: "Holat va xizmat" },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await adminApi.login(username, password); onLogin(result.admin); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <main className="admin-login"><form className="login-card" onSubmit={submit}>
    <div className="login-brand"><span className="brand-mark">FS</span><span>Flex Shop <small>Boshqaruv markazi</small></span></div>
    <div className="login-intro"><span className="eyebrow">XUSH KELIBSIZ</span><h1>Admin panelga kirish</h1><p>Do‘koningizni bir joydan boshqaring.</p></div>
    {error && <ErrorBox text={error} close={() => setError("")}/>}
    <label className="form-field">Login<input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></label>
    <label className="form-field">Parol<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
    <button className="save login-submit" disabled={busy}>{busy ? <Icon name="loader"/> : <Icon name="shield"/>}{busy ? "Kirilmoqda…" : "Panelga kirish"}<Icon name="arrow-right" size={16}/></button>
    <p className="login-note"><Icon name="shield" size={13}/> Faqat administratorlar uchun</p>
  </form></main>;
}

function PackageRow({ item, onSave, onDelete }) {
  const [price, setPrice] = useState(String(item.retailPriceUzs));
  const [order, setOrder] = useState(String(item.sortOrder));
  const [visible, setVisible] = useState(item.visible);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setPrice(String(item.retailPriceUzs)); setOrder(String(item.sortOrder)); setVisible(item.visible); }, [item.retailPriceUzs, item.sortOrder, item.visible]);
  function openEditor() {
    setPrice(String(item.retailPriceUzs)); setOrder(String(item.sortOrder)); setVisible(item.visible); setEditing(true);
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try { await onSave(item.id, { retailPriceUzs: Number(price), sortOrder: Number(order), visible }); setEditing(false); }
    finally { setBusy(false); }
  }
  const invalid = price.trim() === "" || !Number.isSafeInteger(Number(price)) || Number(price) < 0 || !Number.isSafeInteger(Number(order));
  return <><tr>
    <td data-label="Paket"><div className="product-cell"><span className={`product-icon ${item.type === "pubg_uc" ? "amber" : "violet"}`}><Icon name={item.type === "pubg_uc" ? "game" : "shield"} size={17}/></span><div><strong>{item.name}</strong><small>{item.type === "pubg_uc" ? "PUBG Mobile" : "Telegram Premium"}</small></div></div></td>
    <td data-label="API narxi"><span className="api-price">{usd(item.providerPriceUsd)}</span></td>
    <td data-label="Mijoz narxi"><strong className="retail-price">{money(item.retailPriceUzs)}</strong></td>
    <td data-label="Tartib"><span className="package-order">#{item.sortOrder}</span></td>
    <td data-label="Holat"><span className={`package-visibility ${item.visible ? "visible" : "inactive"}`}><i/>{item.visible ? "Ko‘rinadi" : "Yashirilgan"}</span></td>
    <td data-label="Amallar"><div className="row-actions"><button className="secondary small" onClick={openEditor}><Icon name="pencil" size={14}/> Tahrirlash</button><button className="icon-button danger-ghost" disabled={busy} onClick={() => onDelete(item.id, item.name)} aria-label={`${item.name} paketini o‘chirish`}><Icon name="trash" size={15}/></button></div></td>
  </tr>{editing && <Modal title="Paketni tahrirlash" subtitle="Mijoz narxi, tartibi va katalogdagi holatini boshqaring." onClose={() => !busy && setEditing(false)} footer={<><button className="secondary" type="button" disabled={busy} onClick={() => setEditing(false)}>Bekor qilish</button><button className="save" type="submit" form={`package-edit-${item.id}`} disabled={busy || invalid}>{busy ? <Icon name="loader" size={15}/> : <Icon name="check" size={15}/>} {busy ? "Saqlanmoqda…" : "Saqlash"}</button></>}>
    <div className="package-edit-summary"><span className={`product-icon ${item.type === "pubg_uc" ? "amber" : "violet"}`}><Icon name={item.type === "pubg_uc" ? "game" : "shield"}/></span><div><strong>{item.name}</strong><span>{item.type === "pubg_uc" ? "PUBG Mobile" : "Telegram Premium"}</span></div><div><small>API narxi</small><b>{usd(item.providerPriceUsd)}</b></div></div>
    <form id={`package-edit-${item.id}`} className="package-edit-form" onSubmit={save}>
      <label>Mijoz narxi <div className="price-field"><input autoFocus aria-label={`${item.name} sotuv narxi`} type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)}/><span>UZS</span></div><small>Mijozdan yechiladigan yakuniy summa</small></label>
      <label>Tartib raqami <input aria-label={`${item.name} tartibi`} type="number" step="1" value={order} onChange={(e) => setOrder(e.target.value)}/><small>Kichik raqam katalogda oldinroq chiqadi</small></label>
      <div className="package-edit-visibility"><div><strong>Mijozlarga ko‘rsatish</strong><small>O‘chirilsa paket do‘kon katalogidan yashiriladi</small></div><Toggle checked={visible} disabled={busy} label={`${item.name} mijozga ko‘rinishi`} onChange={setVisible}/></div>
    </form>
  </Modal>}</>;
}

function PackagesPage() {
  const [items, setItems] = useState([]); const [provider, setProvider] = useState([]);
  const [prices, setPrices] = useState({}); const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(true); const [error, setError] = useState("");
  const [tab, setTab] = useState("configured"); const [adding, setAdding] = useState("");
  async function load() {
    setLoading(true); setProviderLoading(true); setError("");
    const [local, remote] = await Promise.allSettled([adminApi.packages(), adminApi.providerPackages()]);
    if (local.status === "fulfilled") setItems(local.value.items);
    if (remote.status === "fulfilled") setProvider(remote.value.items);
    const errors = [local, remote].filter((r) => r.status === "rejected").map((r) => r.reason.message);
    if (errors.length) setError(`Paketlarni yuklashda xatolik: ${errors.join(". ")}`);
    setLoading(false); setProviderLoading(false);
  }
  useEffect(() => { load(); }, []);
  const configured = useMemo(() => new Set(items.map((x) => `${x.type}:${x.providerProductId}`)), [items]);
  async function save(id, data) {
    try { const r = await adminApi.updatePackage(id, data); setItems((old) => old.map((x) => x.id === id ? r.item : x)); }
    catch (err) { setError(err.message); throw err; }
  }
  async function remove(id, name) {
    if (!window.confirm(`“${name}” paketini o‘chirasizmi?`)) return;
    try { await adminApi.deletePackage(id); setItems((old) => old.filter((x) => x.id !== id)); }
    catch (err) { setError(err.message); }
  }
  async function add(item) {
    const key = `${item.type}:${item.providerProductId}`; const raw = prices[key] ?? ""; const value = Number(raw);
    if (!raw.trim() || !Number.isSafeInteger(value) || value < 0) { setError("Mijoz narxini to‘g‘ri kiriting"); return; }
    setAdding(key);
    try { const r = await adminApi.createPackage({ type: item.type, providerProductId: item.providerProductId, retailPriceUzs: value }); setItems((old) => [...old, r.item]); }
    catch (err) { setError(err.message); } finally { setAdding(""); }
  }
  return <><PageTitle title="Paketlar" text="Katalog, sotuv narxlari va ko‘rinishni boshqaring." actions={<button className="secondary" disabled={loading} onClick={load}><Icon name={loading ? "loader" : "refresh"} size={15}/> Yangilash</button>}/>
    <div className="metrics-grid packages-metrics"><MetricCard label="Faol paketlar" value={items.filter((x) => x.visible).length} hint="Mijozlarga ko‘rinadi" icon="eye" tone="teal"/><MetricCard label="Yashirilgan" value={items.filter((x) => !x.visible).length} hint="Sotuvda ko‘rinmaydi" icon="hidden" tone="violet"/><MetricCard label="API katalogi" value={provider.length} hint="Mavjud mahsulotlar" icon="layers" tone="blue"/></div>
    {error && <ErrorBox text={error} close={() => setError("")}/>}
    <section className="panel package-panel"><div className="panel-toolbar"><div className="segmented-tabs"><button className={tab === "configured" ? "active" : ""} onClick={() => setTab("configured")}>Mening paketlarim <span>{items.length}</span></button><button className={tab === "provider" ? "active" : ""} onClick={() => setTab("provider")}>API paketlari <span>{provider.length}</span></button></div><span className="toolbar-hint"><Icon name="info" size={13}/> Narxlar admin tomonidan belgilanadi</span></div>
      {loading || (tab === "provider" && providerLoading) ? <div className="loading-state"><Icon name="loader"/> Paketlar yuklanmoqda…</div> : tab === "configured" ? <><div className="table-wrap packages-table"><table className="compact-table"><thead><tr><th>Paket</th><th>API narxi</th><th>Sotuv narxi</th><th>Tartib</th><th>Faol</th><th className="align-right">Amallar</th></tr></thead><tbody>{items.map((item) => <PackageRow key={item.id} item={item} onSave={save} onDelete={remove}/>)}</tbody></table></div>{!items.length && <EmptyState icon="package" title="Hali paket qo‘shilmagan" text="API katalogidan mahsulot tanlab, sotuv narxini belgilang." action={<button className="secondary small" onClick={() => setTab("provider")}><Icon name="plus" size={14}/> API katalogini ochish</button>}/>}<div className="panel-footnote">Jami {items.length} ta paket <span>API narxi USD · Sotuv narxi UZS</span></div></> : <div className="provider-grid">{provider.map((item) => {
        const key = `${item.type}:${item.providerProductId}`; const added = configured.has(key);
        return <article className={`provider-card ${item.type === "pubg_uc" ? "pubg" : "telegram"}`} key={key}><div className="provider-card-head"><span className="product-icon"><Icon name={item.type === "pubg_uc" ? "game" : "shield"}/></span><span className="tag">{item.type === "pubg_uc" ? "PUBG MOBILE" : "TELEGRAM"}</span>{added && <Icon name="check" size={14}/>}</div><h3>{item.name}</h3><div className="provider-cost"><span>API narxi</span><strong>{usd(item.providerPriceUsd)}</strong></div>{added ? <span className="configured-label"><Icon name="check" size={14}/> Katalogga qo‘shilgan</span> : <div className="add-package"><input aria-label={`${item.name} mijoz narxi`} type="number" min="0" step="1" placeholder="Sotuv narxi, UZS" value={prices[key] ?? ""} onChange={(e) => setPrices((old) => ({ ...old, [key]: e.target.value }))}/><button className="save icon-button" disabled={adding === key} aria-label={`${item.name} paketini qo‘shish`} onClick={() => add(item)}><Icon name={adding === key ? "loader" : "plus"} size={16}/></button></div>}</article>;
      })}{!provider.length && <EmptyState icon="layers" title="API katalogi bo‘sh" text="Ma’lumotlarni qayta yuklab ko‘ring."/>}</div>}
    </section></>;
}

function BotPage() {
  const [enabled, setEnabled] = useState(null); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  async function load() { try { const r = await adminApi.botStatus(); setEnabled(r.enabled); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function toggle(next) {
    setBusy(true); setError(""); setNotice("");
    try { const r = await adminApi.setBotStatus(next); setEnabled(r.enabled); if (r.broadcastStarted) setNotice("Bot ishga tushgani haqidagi xabar mijozlarga yuborilmoqda."); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <><PageTitle title="Bot boshqaruvi" text="Do‘kon holati va texnik ishlarni boshqaring."/>
    {error && <ErrorBox text={error} close={() => setError("")}/>}{notice && <div className="admin-alert success"><Icon name="check" size={16}/>{notice}</div>}
    <section className="panel bot-settings"><div className="panel-heading"><Icon name="power" size={17}/><h2>Ishlash holati</h2></div><div className="bot-status-row"><span className={`bot-status-icon ${enabled ? "online" : "offline"}`}><Icon name="bot" size={23}/></span><div className="bot-status-copy"><strong>{enabled === null ? "Holat tekshirilmoqda…" : enabled ? "Bot faol" : "Texnik ishlar"}<span className={`status-dot ${enabled ? "online" : "offline"}`}/></strong><p>{enabled ? "Mijozlar do‘konga kirib, xarid qilishlari mumkin." : "Mijozlarga texnik ishlar haqidagi xabar ko‘rsatiladi."}</p></div><div className="bot-toggle"><span>{busy ? "Saqlanmoqda…" : enabled ? "Yoqilgan" : "O‘chirilgan"}</span><Toggle checked={enabled} disabled={busy || enabled === null} label="Botni yoqish yoki o‘chirish" onChange={toggle}/></div></div></section>
    <div className="bot-info-grid"><article><span className="info-icon amber"><Icon name="alert" size={17}/></span><h3>Texnik ishlar rejimi</h3><p>Bot o‘chirilganda mijozlar texnik ishlar haqidagi oynani ko‘radi. Joriy to‘lovlar qayta ishlanishda davom etadi.</p></article><article><span className="info-icon blue"><Icon name="bot" size={17}/></span><h3>Avtomatik xabarnoma</h3><p>Bot qayta yoqilganda foydalanuvchilarga do‘kon ishga tushgani haqida Telegram xabari yuboriladi.</p></article></div>
  </>;
}

function Dashboard({ admin, onLogout }) {
  const [page, setPage] = useState("packages"); const [logoutError, setLogoutError] = useState("");
  const active = menu.find((item) => item.id === page);
  async function logout() { try { await onLogout(); } catch (error) { setLogoutError(error.message); } }
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="brand"><span className="brand-mark">FS</span><div>Flex Shop<small>Boshqaruv markazi</small></div></div><div className="sidebar-section-label">BOSHQARUV</div><nav aria-label="Admin bo‘limlari">{menu.map((item) => <button type="button" key={item.id} aria-current={page === item.id ? "page" : undefined} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><Icon name={item.icon} size={18}/><span>{item.label}</span>{page === item.id && <span className="nav-active-dot"/>}</button>)}</nav><div className="sidebar-footer"><span className="sidebar-shop"><span className="status-dot online"/> Flex Shop</span><span>Admin panel · v1.0</span></div><div className="admin-user"><span className="user-avatar">{admin.username.slice(0, 1).toUpperCase()}</span><div><strong>{admin.username}</strong><small>Administrator</small></div><button className="icon-button" aria-label="Hisobdan chiqish" onClick={logout}><Icon name="logout" size={17}/></button></div></aside>
    <div className="admin-workspace"><div className="admin-topbar"><div className="breadcrumb"><span>Admin panel</span><Icon name="chevron-right" size={13}/><strong>{active.label}</strong></div><div className="topbar-user"><span className="topbar-role"><Icon name="shield" size={13}/> Administrator</span><button className="icon-button" aria-label="Hisobdan chiqish" onClick={logout}><Icon name="logout" size={17}/></button></div></div><main className="admin-content">{logoutError && <ErrorBox text={logoutError} close={() => setLogoutError("")}/>}{page === "packages" ? <PackagesPage/> : page === "cards" ? <PaymentCardsPage/> : page === "orders" ? <OrdersPage/> : page === "statistics" ? <StatisticsPage/> : <BotPage/>}</main></div>
    <nav className="mobile-nav" aria-label="Mobil bo‘limlar">{menu.map((item) => <button type="button" key={item.id} aria-current={page === item.id ? "page" : undefined} className={page === item.id ? "active" : ""} onClick={() => { setPage(item.id); window.scrollTo({ top: 0 }); }}><Icon name={item.icon} size={19}/><small>{item.short ?? item.label}</small></button>)}</nav></div>;
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { document.documentElement.classList.add("admin-document"); adminApi.me().then((r) => setAdmin(r.admin)).catch(() => {}).finally(() => setLoading(false)); return () => document.documentElement.classList.remove("admin-document"); }, []);
  if (loading) return <main className="admin-loading"><span className="brand-mark">FS</span><Icon name="loader"/></main>;
  if (!admin) return <Login onLogin={setAdmin}/>;
  return <Dashboard admin={admin} onLogout={async () => { await adminApi.logout(); setAdmin(null); }}/>;
}
