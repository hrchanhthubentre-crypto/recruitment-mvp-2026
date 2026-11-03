import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, MemoryRouter } from "react-router-dom";

// Bản xuất bản dạng artifact dùng MemoryRouter (không đụng vào location.hash); bản chạy thường dùng HashRouter.
const Router = import.meta.env.VITE_ROUTER === "memory" ? MemoryRouter : HashRouter;
import { Toaster } from "sonner";
import "./index.css";
import App from "./App";
import { StoreProvider } from "@/lib/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <Router>
        <App />
      </Router>
      <Toaster position="top-center" offset={56} toastOptions={{ style: { fontFamily: "var(--font-sans)", borderRadius: 12 } }} />
    </StoreProvider>
  </StrictMode>,
);
