import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FinPilot AI",
  description: "AI-Powered Personal Finance Advisor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </body>
    </html>
  );
}
