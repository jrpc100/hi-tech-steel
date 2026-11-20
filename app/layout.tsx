
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI-TECH | Steel Doors & Windows",
  description:
    "Premium steel doors and windows. HI-TECH, Koppam, Palakkad, Kerala.",
  applicationName: "HI-TECH"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
