import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prodige RH Tools",
  description: "Outils professionnels pour Prodige RH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
