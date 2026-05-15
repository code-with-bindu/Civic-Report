import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

setBaseUrl(import.meta.env.VITE_API_URL || "https://workspaceapi-server-production-68ec.up.railway.app");

createRoot(document.getElementById("root")!).render(<App />);
