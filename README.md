# Flex Shop frontend

## Ishga tushirish

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Backend manzili `.env` faylidagi `VITE_API_URL` orqali beriladi. Namuna uchun
`.env.example` faylidan foydalaning.

## Tuzilma

- `src/App.jsx` — React ilova mount va lifecycle qatlami.
- `src/styles/game.css` — mavjud dizaynning to'liq stillari.
- `src/legacy/game-template.html` — ekranlar va modal konteynerlari.
- `src/legacy/game-runtime.js` — hozirgi prototipning interaktiv oqimlari.
- `src/services/api.js` — kelajakdagi backend integratsiyasi uchun HTTP qatlam.

`game.html` original prototip sifatida saqlangan.
