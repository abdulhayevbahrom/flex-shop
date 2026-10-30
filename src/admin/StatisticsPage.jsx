import { useEffect, useMemo, useState } from "react";
import { adminApi } from "./adminApi";
import { Icon, PageTitle, EmptyState, ErrorBox, MetricCard, money, usd } from "./admin-ui";

const currentMonth = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  return `${parts.find((part) => part.type === "year").value}-${parts.find((part) => part.type === "month").value}`;
};
const typeLabel = (value) => value === "pubg_uc" ? "PUBG Mobile" : value === "telegram_premium" ? "Telegram Premium" : value;
const monthNames = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const monthShortNames = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
const shortMonth = (value) => {
  const month = Number(value.split("-")[1]);
  return monthShortNames[month - 1];
};
const longMonth = (value) => {
  const [year, month] = value.split("-").map(Number);
  return `${year}-yil ${monthNames[month - 1]}`;
};
const compactNumber = (value) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
const palette = ["#8b7cf8", "#38cbb4", "#f0b759", "#6d9bfa", "#ee81ac"];

function ProductTable({ products }) {
  if (!products.length) return <EmptyState icon="package" title="Paketlar bo‘yicha savdo yo‘q" text="Bajarilgan zakazlar paydo bo‘lganda paketlar kesimidagi ma’lumotlar ko‘rinadi." />;
  return <div className="table-wrap report-products"><table className="compact-table"><thead><tr><th>Paket</th><th>Zakazlar</th><th>Savdo (UZS)</th><th>API xarajati ($)</th></tr></thead><tbody>{products.map((item) => <tr key={`${item.type}:${item.title}`}><td data-label="Paket"><strong>{item.title || "Nomsiz paket"}</strong><small>{typeLabel(item.type)}</small></td><td data-label="Zakazlar"><span className="report-order-count">{item.orders} ta</span></td><td data-label="Savdo"><strong>{money(item.revenueUzs)}</strong></td><td data-label="API xarajati"><span className="report-usd">{usd(item.providerCostUsd)}</span></td></tr>)}</tbody></table></div>;
}

function GamesBreakdown({ games, totalOrders }) {
  const parts = useMemo(() => {
    let offset = 0;
    return games.map((game, index) => {
      const share = totalOrders > 0 ? Number(game.orders) / totalOrders * 100 : 0;
      const part = { ...game, color: palette[index % palette.length], share, start: offset };
      offset += share;
      return part;
    });
  }, [games, totalOrders]);
  const donut = parts.length ? `conic-gradient(${parts.map((part) => `${part.color} ${part.start}% ${part.start + part.share}%`).join(", ")})` : undefined;
  if (!games.length) return <EmptyState icon="game" title="Bu oyda savdo qayd etilmagan" text="O‘yinlar ulushi bajarilgan zakazlar asosida hisoblanadi." />;
  return <div className="report-games-body">
    <div className="report-donut" style={{ background: donut }} role="img" aria-label={parts.map((part) => `${part.title}: ${part.share.toFixed(1)}%`).join(", ")}><div><strong>{totalOrders}</strong><span>ta zakaz</span></div></div>
    <div className="report-game-legend">{parts.map((game) => <div key={game.type}><span className="report-legend-dot" style={{ background: game.color }} /><div><strong>{game.title}</strong><small>{game.orders} ta zakaz</small></div><b>{game.share.toFixed(1)}%</b></div>)}</div>
  </div>;
}

function RevenueChart({ trend }) {
  const [metric, setMetric] = useState("revenueUzs");
  const series = useMemo(() => {
    const values = new Map(trend.map((item) => [item.month, item]));
    const [year, month] = currentMonth().split("-").map(Number);
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 12 + index, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      return { month: key, revenueUzs: 0, providerCostUsd: 0, orders: 0, ...values.get(key) };
    });
  }, [trend]);
  const max = Math.max(...series.map((item) => Number(item[metric]) || 0), 1);
  const hasValues = series.some((item) => Number(item[metric]) > 0);
  const formatValue = metric === "revenueUzs" ? money : usd;
  return <section className="report-panel report-chart-panel">
    <div className="report-panel-heading"><div><h2>Savdo dinamikasi</h2><p>Oxirgi 12 oy · {metric === "revenueUzs" ? "UZS" : "USD"}</p></div><div className="report-chart-tabs" role="group" aria-label="Grafik ko‘rsatkichi"><button type="button" className={metric === "revenueUzs" ? "active" : ""} aria-pressed={metric === "revenueUzs"} onClick={() => setMetric("revenueUzs")}>Savdo</button><button type="button" className={metric === "providerCostUsd" ? "active" : ""} aria-pressed={metric === "providerCostUsd"} onClick={() => setMetric("providerCostUsd")}>API xarajati</button></div></div>
    <div className="report-chart" aria-label={`Oxirgi 12 oy ${metric === "revenueUzs" ? "savdo" : "API xarajatlari"} grafigi`}>
      <div className="report-chart-axis" aria-hidden="true">{[1, .75, .5, .25, 0].map((fraction) => <span key={fraction}>{metric === "providerCostUsd" ? "$" : ""}{compactNumber(hasValues ? max * fraction : 0)}</span>)}</div>
      <div className="report-chart-plot"><div className="report-chart-grid" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div><div className="report-chart-columns">{series.map((item) => <div className={`report-chart-column ${metric === "providerCostUsd" ? "teal" : "violet"}`} key={item.month}><div className="report-chart-bar-track"><div className={`report-chart-bar ${Number(item[metric]) ? "" : "zero"}`} style={{ height: `${Number(item[metric] || 0) / max * 100}%` }} tabIndex="0" role="img" aria-label={`${longMonth(item.month)}: ${formatValue(item[metric])}, ${item.orders} ta zakaz`}><span className="report-chart-tooltip"><b>{longMonth(item.month)}</b><strong>{formatValue(item[metric])}</strong><small>{item.orders} ta zakaz</small></span></div></div><span className="report-chart-month">{shortMonth(item.month)}</span></div>)}</div></div>
    </div>
    {!hasValues && <p className="report-chart-empty"><Icon name="info" size={14} />Hozircha ushbu davr uchun savdo ma’lumoti yo‘q</p>}
  </section>;
}

export default function StatisticsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    adminApi.statistics(month).then((result) => {
      if (active) setData({ ...result, games: result.games || [], products: result.products || [], trend: result.trend || [] });
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month, revision]);
  const totals = data?.totals || { revenueUzs: 0, providerCostUsd: 0, orders: 0 };
  const topSales = data?.games.reduce((best, game) => !best || game.orders > best.orders ? game : best, null);
  const sameMonth = !data || data.month === month;
  const value = (content) => loading ? "…" : sameMonth ? content : "—";

  return <>
    <PageTitle title="Oylik statistika" text="Bajarilgan zakazlar va o‘yinlar bo‘yicha savdo hisoboti" actions={<div className="report-date-actions"><label className="report-month-picker"><Icon name="calendar" size={16} /><span className="sr-only">Hisobot oyi</span><input type="month" aria-label="Hisobot oyi" value={month} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} /></label><button type="button" className="icon-button" aria-label="Hisobotni yangilash" disabled={loading} onClick={() => setRevision((old) => old + 1)}><Icon name="refresh" size={16} /></button></div>} />
    {error && <ErrorBox text={error} close={() => setError("")} />}
    <div className="report-metrics" aria-busy={loading}>
      <MetricCard label="Jami savdo" value={value(money(totals.revenueUzs))} hint="Mijozlar narxi · UZS" icon="wallet" tone="violet" />
      <MetricCard label="API xarajati" value={value(usd(totals.providerCostUsd))} hint="Provider narxi · USD" icon="dollar" tone="teal" />
      <MetricCard label="Bajarilgan zakazlar" value={value(Number(totals.orders).toLocaleString("uz-UZ"))} hint={longMonth(month)} icon="orders" tone="blue" />
      <MetricCard label="Eng ko‘p sotilgan" value={value(topSales?.title || "—")} hint={topSales ? `${topSales.orders} ta zakaz · ${totals.orders ? (topSales.orders / totals.orders * 100).toFixed(0) : 0}% ulush` : "Bajarilgan zakazlar yo‘q"} icon="game" tone="amber" />
    </div>
    {loading ? <div className="report-loading" role="status"><span className="loading-spinner" />Hisobot yuklanmoqda...</div> : !data || !sameMonth ? <section className="report-panel"><EmptyState icon="chart" title="Hisobotni yuklab bo‘lmadi" text="Qayta yuklash orqali yana urinib ko‘ring." action={<button type="button" className="secondary" onClick={() => setRevision((old) => old + 1)}>Qayta yuklash</button>} /></section> : <>
      <div className="report-overview-grid"><RevenueChart trend={data.trend} /><section className="report-panel report-games-panel"><div className="report-panel-heading"><div><h2>O‘yinlar ulushi</h2><p>Zakazlar soni bo‘yicha</p></div><Icon name="game" size={18} /></div><GamesBreakdown games={data.games} totalOrders={totals.orders} /></section></div>
      <section className="report-panel"><div className="report-panel-heading"><div><h2>O‘yinlar bo‘yicha hisobot</h2><p>{longMonth(data.month)} · faqat bajarilgan zakazlar</p></div><span className="report-total-badge">{data.games.length} ta xizmat</span></div>{data.games.length ? <div className="table-wrap report-game-table"><table className="compact-table"><thead><tr><th>O‘yin / xizmat</th><th>Zakazlar</th><th>Ulushi</th><th>Savdo (UZS)</th><th>API xarajati ($)</th></tr></thead><tbody>{data.games.map((game, index) => <tr key={game.type}><td data-label="Xizmat"><div className="report-game-name"><span className={`order-product-icon ${game.type === "pubg_uc" ? "pubg" : "telegram"}`}><Icon name={game.type === "pubg_uc" ? "game" : "package"} size={17} /></span><strong>{game.title}</strong></div></td><td data-label="Zakazlar"><span className="report-order-count">{game.orders} ta</span></td><td data-label="Ulushi"><div className="report-share"><i><span style={{ width: `${totals.orders ? game.orders / totals.orders * 100 : 0}%`, background: palette[index % palette.length] }} /></i><b>{totals.orders ? (game.orders / totals.orders * 100).toFixed(1) : 0}%</b></div></td><td data-label="Savdo"><strong>{money(game.revenueUzs)}</strong></td><td data-label="API xarajati"><span className="report-usd">{usd(game.providerCostUsd)}</span></td></tr>)}</tbody></table></div> : <EmptyState icon="game" title="Bu oyda bajarilgan zakaz yo‘q" text="Savdo boshlanganda o‘yinlar kesimidagi hisobot shu yerda ko‘rinadi." />}</section>
      <section className="report-panel"><div className="report-panel-heading"><div><h2>Paketlar kesimida</h2><p>Eng ko‘p sotilgan paketlar tartibida</p></div><span className="report-total-badge">{data.products.length} ta paket</span></div><ProductTable products={data.products} /></section>
    </>}
  </>;
}
