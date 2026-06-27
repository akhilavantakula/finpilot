"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Filter } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const CATEGORIES = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Health & Medical", "Utilities", "Groceries", "Other"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [form, setForm] = useState({ description: "", amount: "", category: "Food & Dining", date: new Date().toISOString().split("T")[0] });
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const res = await axios.get(`${API}/api/expenses?limit=100`);
    setExpenses(res.data);
  };

  useEffect(() => { load(); }, []);

  const addExpense = async () => {
    if (!form.description || !form.amount) return;
    setAdding(true);
    await axios.post(`${API}/api/expenses/`, { ...form, amount: parseFloat(form.amount) });
    setForm({ description: "", amount: "", category: "Food & Dining", date: new Date().toISOString().split("T")[0] });
    await load();
    setAdding(false);
  };

  const deleteExpense = async (id: number) => {
    await axios.delete(`${API}/api/expenses/${id}`);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const filtered = filter ? expenses.filter(e => e.category === filter) : expenses;

  const CATEGORY_COLORS: Record<string, string> = {
    "Food & Dining": "bg-orange-500/20 text-orange-400",
    "Transport": "bg-blue-500/20 text-blue-400",
    "Shopping": "bg-purple-500/20 text-purple-400",
    "Entertainment": "bg-pink-500/20 text-pink-400",
    "Health & Medical": "bg-green-500/20 text-green-400",
    "Utilities": "bg-yellow-500/20 text-yellow-400",
    "Groceries": "bg-teal-500/20 text-teal-400",
    "Other": "bg-slate-500/20 text-slate-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Expenses</h1>
        <p className="text-muted text-sm mt-1">Track and manage your spending</p>
      </div>

      {/* Add Expense Form */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Plus size={16} className="text-primary" />Add Expense</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Description" className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary col-span-2 lg:col-span-1" />
          <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            placeholder="Amount (₹)" type="number" className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary" />
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
            type="date" className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
        </div>
        <button onClick={addExpense} disabled={adding}
          className="mt-3 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          {adding ? "Adding..." : "Add Expense"}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted" />
        <button onClick={() => setFilter("")} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!filter ? "bg-primary text-white" : "border border-border text-muted hover:text-white"}`}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c === filter ? "" : c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === c ? "bg-primary text-white" : "border border-border text-muted hover:text-white"}`}>{c}</button>
        ))}
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {filtered.map(e => (
          <div key={e.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[e.category] || "bg-slate-500/20 text-slate-400"}`}>{e.category}</span>
              <div>
                <p className="text-sm text-white font-medium">{e.description}</p>
                <p className="text-xs text-muted">{e.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">₹{e.amount.toLocaleString("en-IN")}</span>
              <button onClick={() => deleteExpense(e.id)} className="text-muted hover:text-danger transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted py-10 text-sm">No expenses found.</p>}
      </div>
    </div>
  );
}
