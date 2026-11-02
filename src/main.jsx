import { createRoot } from "react-dom/client";

const module = window.location.pathname.startsWith("/admin")
  ? await import("./admin/AdminApp")
  : await import("./App");
const RootApp = module.default;



createRoot(document.getElementById("root")).render(<RootApp />);
