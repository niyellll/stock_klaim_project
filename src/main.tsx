import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import { StockClaimApp } from "../app/stock-claim-app";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element is missing.");
}

createRoot(root).render(
  <StrictMode>
    <StockClaimApp />
  </StrictMode>,
);
