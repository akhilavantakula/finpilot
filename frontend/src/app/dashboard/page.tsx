"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, TrendingUp, AlertTriangle, Receipt } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);

  useEffect(() => {
    axios.get(`${API}/api/expenses/summary`).then(r => setSummary(r.data));
    axios.get(`${API}/api/anomalies`).then(r => setAnomalyCount(r.data.total_flagged));
    axios.get(`${API}/api/expenses?limit=100`).then(r => setExpenseCount(r.data.length));
  }, []);

  const stats = [
    { label: "Total Spent", value: `₹${summary?.total_spent?.toLocaleString("en-IN") || 0}`, icon: IndianRupee, color: "text-primary" },
    { label: "Categories", value: summary?.by_category?.length || 0, icon: TrendingUp, color: "text-success" },
    { label: "Transactions", value: expenseCount, icon: Receipt, color: "text-accent" },
    { label: "Anomalies", value: anomalyCount, icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Your financial overview at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted text-xs font-medium uppercase tracking-wide">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {summary?.by_category?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={summary.by_category} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {summary.by_category.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Amount per Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.by_category}>
                <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Total"]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {summary.by_category.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!summary?.by_category?.length && (
        <div className="glass rounded-xl p-10 text-center">
          <Receipt size={40} className="mx-auto text-muted mb-3" />
          <p className="text-muted">No expenses yet. Add expenses or scan a receipt to get started.</p>
        </div>
      )}
    </div>
  );
}
