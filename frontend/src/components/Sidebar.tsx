"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageCircle, Receipt, AlertTriangle, Upload, TrendingUp } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Advisor", icon: MessageCircle },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
  { href: "/upload", label: "Scan Receipt", icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col py-6 px-4 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <TrendingUp className="text-primary" size={24} />
        <span className="text-xl font-bold text-white">FinPilot <span className="text-primary">AI</span></span>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active ? "bg-primary/20 text-primary border border-primary/30" : "text-muted hover:text-white hover:bg-white/5"}`}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-primary font-medium">RAG-Powered</p>
          <p className="text-xs text-muted mt-1">Financial advice grounded in curated knowledge</p>
        </div>
      </div>
    </aside>
  );
}
