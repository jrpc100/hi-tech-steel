
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HI-TECH | Steel Door & Window Frames",
  description:
    "Premium steel door frames and window frames from HI-TECH, Koppam, Palakkad, Kerala.",
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
