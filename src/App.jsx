import { useEffect, useRef, useState } from "react";
import gameTemplate from "./legacy/game-template.html?raw";
import gameRuntime from "./legacy/game-runtime.js?raw";
import { api } from "./services/api";
import "./styles/game.css";

const RUNTIME_ID = "flex-shop-runtime";

export default function App() {
  const hostRef = useRef(null);
  const [botState, setBotState] = useState({ loading: true, enabled: true, message: "" });

  useEffect(() => {
    api.getBotStatus()
      .then((result) => setBotState({ loading: false, enabled: result.enabled, message: result.message }))
      .catch(() => setBotState({ loading: false, enabled: true, message: "" }));
  }, []);

  useEffect(() => {
    if (botState.loading || !botState.enabled) return;
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = gameTemplate;
    window.__FLEX_API__ = api;

    const previousRuntime = document.getElementById(RUNTIME_ID);
    previousRuntime?.remove();

    const runtime = document.createElement("script");
    runtime.id = RUNTIME_ID;
    runtime.textContent = gameRuntime;
    document.body.appendChild(runtime);

    return () => {
      runtime.remove();
      delete window.__FLEX_API__;
      host.replaceChildren();
    };
  }, [botState.loading, botState.enabled]);

  if (botState.loading) return <div className="maintenance-screen"><div className="maintenance-spinner" /></div>;
  if (!botState.enabled) return <div className="maintenance-screen"><div className="maintenance-card"><div className="maintenance-icon">🛠</div><h1>Texnik ishlar</h1><p>{botState.message}</p><button onClick={() => window.location.reload()}>Qayta tekshirish</button></div></div>;

  return <div ref={hostRef} />;
}
