import { useEffect, useState } from "react";
import { adminApi } from "./adminApi";
import { Icon, PageTitle, EmptyState, ErrorBox, Modal, money, usd, dateTime } from "./admin-ui";

const statusLabels = {
  awaiting_payment: "To‘lov kutilmoqda",
  created: "Yaratildi",
  processing: "Bajarilmoqda",
  completed: "Bajarildi",
  failed: "Xato",
  refunded: "Qaytarildi",
  cancelled: "Bekor qilindi",
};
const paymentStatusLabels = { pending: "To‘lov kutilmoqda", reviewing: "Tekshirilmoqda", completed: "To‘langan", rejected: "Rad etilgan", expired: "Muddati tugagan" };

const productType = (type) => type === "pubg_uc" ? "PUBG Mobile" : type === "telegram_premium" ? "Telegram Premium" : type || "—";
const personName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Noma’lum mijoz";
const telegramName = (value) => value ? `@${String(value).replace(/^@/, "")}` : "—";
const shortId = (value) => value ? `#${String(value).slice(-8).toUpperCase()}` : "—";

function Status({ value }) {
  return <span className={`status ${value || ""}`}><i aria-hidden="true" />{statusLabels[value] || value || "—"}</span>;
}

function Detail({ label, value, copy = false }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    if (!copied && !copyError) return undefined;
    const timer = window.setTimeout(() => { setCopied(false); setCopyError(false); }, 1800);
    return () => window.clearTimeout(timer);
  }, [copied, copyError]);
  async function copyValue() {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
    } catch {
      setCopyError(true);
    }
  }
  const hasValue = value !== undefined && value !== null && value !== "" && value !== "—";
  return <div className={`order-detail ${copy ? "order-detail-copy" : ""}`}>
    <span>{label}</span>
    <div><strong>{hasValue ? value : "—"}</strong>{copy && hasValue && <button type="button" className="icon-button" onClick={copyValue} aria-label={`${label}ni nusxalash`} title={copied ? "Nusxalandi" : "Nusxalash"}><Icon name={copied ? "check" : "copy"} size={14} /></button>}</div>
    {(copied || copyError) && <small role="status">{copied ? "Nusxalandi" : "Nusxalanmadi, matnni belgilang"}</small>}
  </div>;
}

function DetailSection({ icon, title, children }) {
  return <section className="order-detail-section"><h3><Icon name={icon} size={16} />{title}</h3><div className="order-detail-grid">{children}</div></section>;
}

function OrderModal({ id, onClose }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    setOrder(null);
    adminApi.order(id).then((result) => { if (active) setOrder(result.order); }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id, revision]);

  return <Modal title="Zakaz tafsilotlari" subtitle={shortId(id)} onClose={onClose} footer={<><span className="order-modal-note"><Icon name="info" size={14} />Zakazning saqlangan ma’lumotlari</span><button type="button" className="secondary" onClick={onClose}>Yopish</button></>}>
    {error ? <><ErrorBox text={error} /><button type="button" className="secondary" onClick={() => setRevision((value) => value + 1)}><Icon name="refresh" size={15} />Qayta yuklash</button></> : !order ? <div className="order-modal-loading" role="status"><span className="loading-spinner" />Tafsilotlar yuklanmoqda...</div> : <>
      <div className="order-modal-summary">
        <div className={`order-product-icon ${order.type === "pubg_uc" ? "pubg" : "telegram"}`}><Icon name={order.type === "pubg_uc" ? "game" : "package"} size={22} /></div>
        <div><h3>{order.product?.title || productType(order.type)}</h3><p>{productType(order.type)}</p></div>
        <Status value={order.status} />
      </div>
      <DetailSection icon="orders" title="Zakaz ma’lumotlari">
        <Detail label="Zakaz ID" value={order.id} copy />
        <Detail label="Provider ID" value={order.providerOrderId} copy />
        <Detail label="Mijoz narxi" value={money(order.chargedUzs)} />
        <Detail label="API narxi" value={usd(order.costUsd)} />
        {order.product?.quantity != null && <Detail label="Miqdor" value={order.product.quantity} />}
        {order.product?.months != null && <Detail label="Obuna muddati" value={`${order.product.months} oy`} />}
        {order.product?.offerId && <Detail label="Paket ID" value={order.product.offerId} copy />}
      </DetailSection>
      <DetailSection icon="user" title="Sotib olgan mijoz">
        <Detail label="Ism va familiya" value={personName(order.user)} />
        <Detail label="Telegram username" value={telegramName(order.user?.username)} copy />
        <Detail label="Telegram ID" value={order.user?.telegramId} copy />
        <Detail label="Mijoz ID" value={order.user?.id} copy />
      </DetailSection>
      <DetailSection icon="game" title="Qabul qiluvchi akkaunt">
        {order.type === "pubg_uc" ? <><Detail label="Player ID" value={order.recipient?.playerId} copy /><Detail label="Player nomi" value={order.recipient?.playerName} /></> : <Detail label="Telegram username" value={telegramName(order.recipient?.telegramUsername)} copy />}
      </DetailSection>
      <DetailSection icon="wallet" title="To‘lov ma’lumotlari">
        <Detail label="To‘lov summasi" value={order.paymentAmountUzs != null ? money(order.paymentAmountUzs) : "—"} />
        <Detail label="To‘lov holati" value={paymentStatusLabels[order.topUp?.status] || order.topUp?.status} />
        <Detail label="Karta nomi" value={order.topUp?.cardLabel} />
        <Detail label="Karta raqami" value={order.topUp?.cardNumber?.replace(/(.{4})(?=.)/g, "$1 ")} copy />
        <Detail label="Karta egasi" value={order.topUp?.cardHolder} />
        <Detail label="To‘lov ID" value={order.topUp?._id || order.topUp?.id} copy />
      </DetailSection>
      <DetailSection icon="clock" title="Vaqtlar">
        <Detail label="Yaratilgan" value={dateTime(order.createdAt)} />
        <Detail label="To‘lov muddati" value={dateTime(order.paymentExpiresAt)} />
        <Detail label="To‘langan" value={dateTime(order.paidAt)} />
        <Detail label="Bajarilgan" value={dateTime(order.completedAt)} />
        {order.refundedAt && <Detail label="Qaytarilgan" value={dateTime(order.refundedAt)} />}
      </DetailSection>
      {order.failureReason && <div className="order-failure"><Icon name="info" size={17} /><div><strong>Xato sababi</strong><p>{order.failureReason}</p></div></div>}
      <details className="order-provider-response"><summary><Icon name="package" size={15} />Provider javobi<Icon name="chevron-right" size={15} /></summary><pre>{JSON.stringify(order.providerPayload ?? {}, null, 2)}</pre></details>
    </>}
  </Modal>;
}

export default function OrdersPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState({ page: 1, search: "", status: "", type: "" });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    adminApi.orders({ ...query, limit: 20 }).then((result) => {
      if (active) setData({ ...result, items: result.items || [] });
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, revision]);
  const filtered = Boolean(query.search || query.status || query.type);
  const pages = Math.max(data.pages || 1, 1);
  const currentPage = Math.min(data.page, pages);
  const first = data.total ? (data.page - 1) * 20 + 1 : 0;
  const last = Math.min(data.page * 20, data.total);
  function resetFilters() {
    setSearch("");
    setQuery({ page: 1, search: "", status: "", type: "" });
  }

  return <>
    <PageTitle title="Zakazlar" text="Xaridlar, to‘lov holati va qabul qiluvchi akkauntlar" actions={<button type="button" className="secondary" disabled={loading} onClick={() => setRevision((value) => value + 1)}><Icon name="refresh" size={15} /><span>Yangilash</span></button>} />
    {error && <ErrorBox text={error} close={() => setError("")} />}
    <section className="orders-panel">
      <div className="orders-toolbar">
        <form className="orders-search" onSubmit={(event) => { event.preventDefault(); setQuery((old) => ({ ...old, search: search.trim(), page: 1 })); }}>
          <Icon name="search" size={17} /><input aria-label="Zakazlarni qidirish" placeholder="Zakaz ID, provider ID, Player ID, @username..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <button type="submit" className="save" disabled={loading}>Qidirish</button>
        </form>
        <div className="orders-filters">
          <select aria-label="Zakaz holati" value={query.status} onChange={(event) => setQuery((old) => ({ ...old, status: event.target.value, page: 1 }))}><option value="">Barcha holatlar</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select aria-label="O‘yin yoki xizmat" value={query.type} onChange={(event) => setQuery((old) => ({ ...old, type: event.target.value, page: 1 }))}><option value="">Barcha xizmatlar</option><option value="pubg_uc">PUBG Mobile</option><option value="telegram_premium">Telegram Premium</option></select>
        </div>
      </div>
      <div className="orders-result-bar"><span aria-live="polite"><b>{Number(data.total).toLocaleString("uz-UZ")}</b> ta zakaz{filtered ? " topildi" : " mavjud"}</span>{filtered && <button type="button" onClick={resetFilters}>Filtrlarni tozalash</button>}<span className="orders-open-hint">Tafsilotlar uchun zakazni tanlang</span></div>
      <div className="table-wrap orders-table" aria-busy={loading}>
        <table className="compact-table"><thead><tr><th>Zakaz / sana</th><th>Mahsulot</th><th>Mijoz</th><th>Qabul qiluvchi</th><th>Summa</th><th>Holat</th><th><span className="sr-only">Tafsilotlar</span></th></tr></thead>
          <tbody>{loading ? Array.from({ length: 5 }, (_, row) => <tr className="orders-skeleton" key={row}>{Array.from({ length: 7 }, (_, column) => <td key={column}><span className="skeleton-line" /></td>)}</tr>) : data.items.map((order) => <tr key={order.id} onClick={() => setSelected(order.id)}>
            <td data-label="Zakaz" className="order-id"><button type="button" title={order.id} onClick={(event) => { event.stopPropagation(); setSelected(order.id); }}>{shortId(order.id)}</button><small className="order-date">{dateTime(order.createdAt)}</small></td>
            <td data-label="Mahsulot"><div className="order-product"><span className={`order-product-icon ${order.type === "pubg_uc" ? "pubg" : "telegram"}`}><Icon name={order.type === "pubg_uc" ? "game" : "package"} size={16} /></span><div><strong>{order.product?.title || productType(order.type)}</strong><small>{productType(order.type)}</small></div></div></td>
            <td data-label="Mijoz"><div className="order-customer"><strong>{personName(order.user)}</strong><small>{order.user?.username ? telegramName(order.user.username) : order.user?.telegramId || "—"}</small></div></td>
            <td data-label="Qabul qiluvchi"><strong className="order-recipient">{order.recipient?.playerId || telegramName(order.recipient?.telegramUsername)}</strong>{order.recipient?.playerName && <small>{order.recipient.playerName}</small>}</td>
            <td data-label="Summa"><strong className="order-amount">{money(order.chargedUzs)}</strong><small>API: {usd(order.costUsd)}</small></td>
            <td data-label="Holat"><Status value={order.status} /></td>
            <td className="order-open-cell"><button type="button" className="icon-button" aria-label={`${shortId(order.id)} zakazining tafsilotlari`} onClick={(event) => { event.stopPropagation(); setSelected(order.id); }}><Icon name="chevron-right" size={17} /></button></td>
          </tr>)}</tbody>
        </table>
        {!loading && !data.items.length && <EmptyState icon="orders" title={error ? "Zakazlarni yuklab bo‘lmadi" : filtered ? "Mos zakaz topilmadi" : "Hali zakazlar yo‘q"} text={error ? "Qayta yuklash tugmasi orqali yana urinib ko‘ring." : filtered ? "Qidiruv matni yoki tanlangan filtrlarni o‘zgartiring." : "Mijozlar yaratgan zakazlar shu yerda ko‘rinadi."} action={filtered ? <button type="button" className="secondary" onClick={resetFilters}>Filtrlarni tozalash</button> : error ? <button type="button" className="secondary" onClick={() => setRevision((value) => value + 1)}>Qayta yuklash</button> : undefined} />}
      </div>
      <div className="orders-pagination"><span>{first}–{last} / {data.total} ta zakaz</span><div><button type="button" className="icon-button" disabled={loading || query.page <= 1} onClick={() => setQuery((old) => ({ ...old, page: old.page - 1 }))} aria-label="Oldingi sahifa"><Icon name="arrow-left" size={16} /></button><span><b>{currentPage}</b> / {pages}</span><button type="button" className="icon-button" disabled={loading || query.page >= pages} onClick={() => setQuery((old) => ({ ...old, page: old.page + 1 }))} aria-label="Keyingi sahifa"><Icon name="arrow-right" size={16} /></button></div></div>
    </section>
    {selected && <OrderModal id={selected} onClose={() => setSelected(null)} />}
  </>;
}
