
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI-TECH | Steel Doors & Windows",
  description:
    "Premium Steel Doors and Windows by HI-TECH, Koppam, Palakkad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
