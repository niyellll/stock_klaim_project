import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stok dan Klaim",
  description:
    "Program web terpisah untuk stok barang dan monitoring klaim PT. Berdikari Berkah Mulia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
