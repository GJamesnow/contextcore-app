import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axiom | Truth Engine",
  description: "Real Estate Investment Analysis Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#0f172a] text-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}