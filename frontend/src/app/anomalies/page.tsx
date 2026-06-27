"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, TrendingUp, Bot, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AnomaliesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/api/anomalies`);
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Anomaly Detection</h1>
          <p className="text-muted text-sm mt-1">IQR + Z-score analysis on your spending patterns</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 border border-border text-muted hover:text-white hover:border-primary px-3 py-2 rounded-lg text-sm transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* AI Insights */}
      {data && (
        <div className="glass rounded-xl p-5 border-l-4 border-primary">
          <div className="flex items-start gap-3">
            <Bot size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Gemini AI Insight</p>
              <p className="text-sm text-slate-300 leading-relaxed">{data.insights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-xs text-muted uppercase tracking-wide">Flagged</span>
            </div>
            <p className="text-3xl font-bold text-warning">{data.total_flagged}</p>
            <p className="text-xs text-muted mt-1">anomalous transactions</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-success" />
              <span className="text-xs text-muted uppercase tracking-wide">Method</span>
            </div>
            <p className="text-sm font-semibold text-white">IQR + Z-Score</p>
            <p className="text-xs text-muted mt-1">Statistical outlier detection</p>
          </div>
        </div>
      )}

      {/* Anomaly List */}
      {loading ? (
        <div className="text-center py-10 text-muted text-sm">Analyzing your spending patterns...</div>
      ) : data?.anomalies?.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <TrendingUp size={40} className="mx-auto text-success mb-3" />
          <p className="text-white font-medium">No anomalies detected!</p>
          <p className="text-muted text-sm mt-1">Your spending looks consistent across all categories.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Flagged Transactions</h2>
          {data?.anomalies?.map((a: any, i: number) => (
            <div key={i} className={`glass rounded-xl p-4 border-l-4 ${a.severity === "high" ? "border-danger" : "border-warning"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className={a.severity === "high" ? "text-danger mt-0.5" : "text-warning mt-0.5"} />
                  <div>
                    <p className="text-sm font-medium text-white">{a.description}</p>
                    <p className="text-xs text-muted mt-0.5">{a.category} · {a.date}</p>
                    <p className="text-xs text-slate-400 mt-1">{a.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-bold text-white">₹{a.amount.toLocaleString("en-IN")}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.severity === "high" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"}`}>
                    {a.severity} · z={a.z_score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
