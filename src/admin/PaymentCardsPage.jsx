import { useEffect, useMemo, useState } from "react";
import { adminApi } from "./adminApi";
import { Icon, Toggle, PageTitle, EmptyState, ErrorBox, Modal, formatCardNumber } from "./admin-ui";

const tones = ["indigo", "teal", "amber", "rose"];
const emptyCard = { label: "", number: "", holder: "", sortOrder: 0, active: true };

function network(card) {
  if (String(card.number).startsWith("9860")) return "HUMO";
  if (String(card.number).startsWith("8600")) return "UZCARD";
  return "UZCARD / HUMO";
}

function PlasticCard({ card, tone = "indigo", compact = false }) {
  return <div className={`bank-card bank-card--${tone}${compact ? " bank-card--compact" : ""}`}>
    <div className="bank-card-head">
      <span className="bank-card-label" title={card.label}>{card.label || "To‘lov kartasi"}</span>
      <span className={`bank-card-status${card.active ? " is-active" : ""}`}><i />{card.active ? "Faol" : "Pauzada"}</span>
    </div>
    <div className="bank-card-hardware" aria-hidden="true">
      <span className="bank-card-chip"><i /><i /><i /></span>
      <svg className="bank-card-contactless" width="23" height="27" viewBox="0 0 23 27" fill="none"><path d="M5 9.5a8 8 0 0 1 0 8M9 6a13 13 0 0 1 0 15M13 2.5a18 18 0 0 1 0 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
    </div>
    <div className={`bank-card-number${String(card.number).replace(/\D/g, "").length > 16 ? " is-long" : ""}`}>{formatCardNumber(card.number) || "•••• •••• •••• ••••"}</div>
    <div className="bank-card-bottom">
      <div className="bank-card-holder"><small>KARTA EGASI</small><strong title={card.holder}>{card.holder || "ISM FAMILIYA"}</strong></div>
      <span className="bank-card-network">{network(card)}</span>
    </div>
  </div>;
}

export default function PaymentCardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCard);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try { const result = await adminApi.paymentCards(); setCards(result.items || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let alive = true;
    adminApi.paymentCards()
      .then((result) => { if (alive) setCards(result.items || []); })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const sortedCards = useMemo(() => [...cards].sort((a, b) => a.sortOrder - b.sortOrder || new Date(a.createdAt) - new Date(b.createdAt)), [cards]);
  const activeCards = sortedCards.filter((card) => card.active);
  const usageCount = cards.reduce((sum, card) => sum + Number(card.usageCount || 0), 0);

  function openForm(card = null) {
    setForm(card ? { label: card.label, number: card.number, holder: card.holder, sortOrder: card.sortOrder, active: card.active } : { ...emptyCard, sortOrder: cards.length });
    setFormError("");
    setModal({ mode: card ? "edit" : "create", card });
  }

  function closeModal() {
    if (busy) return;
    setModal(null);
    setFormError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const number = form.number.replace(/\D/g, "");
    if (number.length < 16 || number.length > 19) { setFormError("Karta raqami 16–19 ta raqamdan iborat bo‘lishi kerak."); return; }
    if (!form.label.trim() || !form.holder.trim()) { setFormError("Karta nomi va egasini kiriting."); return; }
    if (!Number.isSafeInteger(Number(form.sortOrder))) { setFormError("Tartib butun son bo‘lishi kerak."); return; }
    setBusy("save");
    setFormError("");
    try {
      const payload = { ...form, label: form.label.trim(), holder: form.holder.trim(), number, sortOrder: Number(form.sortOrder) };
      const result = modal.mode === "edit" ? await adminApi.updatePaymentCard(modal.card.id, payload) : await adminApi.createPaymentCard(payload);
      setCards((old) => modal.mode === "edit" ? old.map((card) => card.id === modal.card.id ? result.item : card) : [...old, result.item]);
      setModal(null);
    } catch (err) { setFormError(err.message); }
    finally { setBusy(""); }
  }

  async function toggleCard(card) {
    if (busy) return;
    setBusy(card.id);
    setError("");
    try {
      const result = await adminApi.updatePaymentCard(card.id, { active: !card.active });
      setCards((old) => old.map((item) => item.id === card.id ? result.item : item));
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  async function remove() {
    if (busy || !modal?.card) return;
    setBusy("delete");
    setFormError("");
    try {
      await adminApi.deletePaymentCard(modal.card.id);
      setCards((old) => old.filter((card) => card.id !== modal.card.id));
      setModal(null);
    } catch (err) { setFormError(err.message); }
    finally { setBusy(""); }
  }

  const change = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }));

  return <div className="payment-cards-page">
    <PageTitle title="To‘lov kartalari" text="Kartalarni boshqaring va to‘lov navbatini belgilang." actions={<>
      <button className="icon-button" type="button" onClick={load} disabled={loading || Boolean(busy)} title="Yangilash" aria-label="Kartalarni yangilash"><Icon name="refresh" /></button>
      <button className="save" type="button" onClick={() => openForm()} disabled={Boolean(busy)}><Icon name="plus" size={16} />Karta qo‘shish</button>
    </>} />

    {error && <ErrorBox text={error} close={() => setError("")} />}

    <div className="cards-overview">
      <div className="cards-overview-icon"><Icon name="credit-card" size={21} /></div>
      <div className="cards-overview-main"><strong>{activeCards.length} <span>faol karta</span></strong><small>{cards.length} ta karta · {usageCount.toLocaleString("uz-UZ")} marta to‘lovga berilgan</small></div>
      <span className="cards-overview-note"><Icon name="layers" size={15} />Navbat bilan taqsimlanadi</span>
    </div>

    {activeCards.length > 0 && <div className="rotation-flow" aria-label="To‘lov kartalarining aylanish tartibi">
      <span className="rotation-label">To‘lov navbati</span>
      {activeCards.slice(0, 3).map((card, index) => <div className="rotation-step" key={card.id}><span className="rotation-index">{index + 1}</span><span>{card.label}</span><Icon name="arrow-right" size={14} /></div>)}
      {activeCards.length > 3 && <span className="rotation-more">+{activeCards.length - 3}</span>}
      <span className="rotation-repeat">Qayta boshidan</span>
    </div>}

    {loading && !cards.length ? <div className="payment-cards-grid" aria-busy="true" aria-label="Kartalar yuklanmoqda">{[0, 1, 2].map((item) => <div className="payment-card-skeleton skeleton" key={item} />)}</div>
      : !cards.length ? <EmptyState icon="credit-card" title="Hali karta qo‘shilmagan" text="Mijozlardan to‘lov qabul qilish uchun birinchi kartani qo‘shing." action={<button className="save" type="button" onClick={() => openForm()}><Icon name="plus" size={16} />Karta qo‘shish</button>} />
      : <div className="payment-cards-grid">{sortedCards.map((card, index) => <article key={card.id} className={`payment-card-shell${card.active ? "" : " is-inactive"}`}>
        <PlasticCard card={card} tone={tones[index % tones.length]} />
        <div className="payment-card-meta"><span><b>#{index + 1}</b> navbat · Tartib: {card.sortOrder}</span><span>{Number(card.usageCount || 0).toLocaleString("uz-UZ")} ta to‘lov</span></div>
        <div className="payment-card-footer">
          <div className="payment-card-toggle"><Toggle checked={card.active} onChange={() => toggleCard(card)} disabled={Boolean(busy)} label={`${card.label} kartasini ${card.active ? "pauzaga qo‘yish" : "faollashtirish"}`} /><span>{busy === card.id ? "Saqlanmoqda…" : card.active ? "To‘lovga ochiq" : "Vaqtincha yopiq"}</span></div>
          <div className="payment-card-actions"><button className="icon-button" type="button" title="Tahrirlash" aria-label={`${card.label} kartasini tahrirlash`} onClick={() => openForm(card)} disabled={Boolean(busy)}><Icon name="pencil" size={16} /></button><button className="icon-button danger-text" type="button" title="O‘chirish" aria-label={`${card.label} kartasini o‘chirish`} onClick={() => { setFormError(""); setModal({ mode: "delete", card }); }} disabled={Boolean(busy)}><Icon name="trash" size={16} /></button></div>
        </div>
      </article>)}</div>}

    {modal && modal.mode !== "delete" && <Modal title={modal.mode === "edit" ? "Kartani tahrirlash" : "Yangi to‘lov kartasi"} subtitle="Karta ma’lumotlari mijozning to‘lov oynasida ko‘rsatiladi." onClose={closeModal} footer={<><button className="secondary" type="button" onClick={closeModal} disabled={Boolean(busy)}>Bekor qilish</button><button className="save" type="submit" form="payment-card-form" disabled={Boolean(busy)}>{busy === "save" ? "Saqlanmoqda…" : modal.mode === "edit" ? "Saqlash" : "Karta qo‘shish"}</button></>}>
      <form id="payment-card-form" className="card-form-grid" onSubmit={submit}>
        {formError && <div className="field-wide"><ErrorBox text={formError} close={() => setFormError("")} /></div>}
        <label className="field-wide">Karta nomi<input autoFocus value={form.label} onChange={change("label")} maxLength={60} placeholder="Masalan, Asosiy HUMO" required disabled={Boolean(busy)} /></label>
        <label className="field-wide">Karta raqami<input className="mono" value={formatCardNumber(form.number)} onChange={(event) => setForm((old) => ({ ...old, number: event.target.value.replace(/\D/g, "").slice(0, 19) }))} inputMode="numeric" autoComplete="off" placeholder="9860 0000 0000 0000" maxLength={23} required disabled={Boolean(busy)} /></label>
        <label className="field-wide">Karta egasi<input value={form.holder} onChange={change("holder")} maxLength={100} autoComplete="off" placeholder="ISM FAMILIYA" required disabled={Boolean(busy)} /></label>
        <label>Navbat tartibi<input type="number" step="1" value={form.sortOrder} onChange={change("sortOrder")} required disabled={Boolean(busy)} /><small>Kichik raqam birinchi ko‘rsatiladi.</small></label>
        <div className="form-toggle-row"><div><strong>Faol karta</strong><small>Yangi zakazlarga ko‘rsatish</small></div><Toggle checked={form.active} onChange={() => setForm((old) => ({ ...old, active: !old.active }))} disabled={Boolean(busy)} label="Kartani faollashtirish" /></div>
      </form>
    </Modal>}

    {modal?.mode === "delete" && <Modal title="Kartani o‘chirish" subtitle="Ushbu karta yangi zakazlarga boshqa ko‘rsatilmaydi." onClose={closeModal} footer={<><button className="secondary" type="button" onClick={closeModal} disabled={Boolean(busy)}>Bekor qilish</button><button className="danger" type="button" onClick={remove} disabled={Boolean(busy)}><Icon name="trash" size={16} />{busy === "delete" ? "O‘chirilmoqda…" : "Kartani o‘chirish"}</button></>}>
      {formError && <ErrorBox text={formError} close={() => setFormError("")} />}
      <div className="delete-card-preview"><Icon name="credit-card" size={24} /><div><strong>{modal.card.label}</strong><span className="mono">•••• •••• •••• {modal.card.number.slice(-4)}</span></div></div>
    </Modal>}
  </div>;
}
