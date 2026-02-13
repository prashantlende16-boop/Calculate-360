import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const origOnerror = window.onerror;
window.onerror = function (msg, source, lineno, colno, error) {
  if (!error || !(error instanceof Error)) {
    return true;
  }
  const src = source || "";
  if (
    src.includes("pagead") ||
    src.includes("googlesyndication") ||
    src.includes("googletagmanager") ||
    src.includes("fundingchoices") ||
    src.includes("google.com")
  ) {
    return true;
  }
  if (origOnerror) {
    return origOnerror(msg, source, lineno, colno, error) as boolean;
  }
  return false;
};

createRoot(document.getElementById("root")!).render(<App />);
