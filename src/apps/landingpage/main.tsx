import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "../../packages/shared-ui/src/styles/index.css";
import "./i18n/config.ts";

createRoot(document.getElementById("root")!).render(<App />);

