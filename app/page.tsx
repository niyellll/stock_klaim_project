import type { Metadata } from "next";
import { StockClaimApp } from "./stock-claim-app";

export const metadata: Metadata = {
  title: "Stok dan Klaim",
  description:
    "Program operasional stok barang, rekonsiliasi pembelian, kartu stok, mutasi stok, dan monitoring klaim PT. Berdikari Berkah Mulia.",
};

export default function Home() {
  return <StockClaimApp />;
}
