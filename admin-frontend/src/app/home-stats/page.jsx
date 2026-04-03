"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, LayoutDashboard, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8002/api";

export default function HomeStatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/home-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to load stats." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
  };

  const handleAddStat = () => {
    setStats([...stats, { num: "", label: "" }]);
  };

  const handleRemoveStat = (index) => {
    const newStats = [...stats];
    newStats.splice(index, 1);
    setStats(newStats);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/home-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats })
      });
      if (res.ok) {
        setStatus({ type: "success", message: "Home stats updated successfully!" });
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to save stats." });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24 lg:pt-8 lg:pl-64">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Home Stats</h1>
            <p className="text-slate-500 font-medium mt-1">Manage the metrics displayed on the main landing page.</p>
          </div>
          <button
            onClick={handleAddStat}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Stat
          </button>
        </div>

        {status.message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${status.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-semibold text-sm">{status.message}</span>
          </div>
        )}

        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-start"
            >
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Metric Value (e.g. "5-20%" or "100x")</label>
                  <input
                    value={stat.num}
                    onChange={(e) => handleChange(index, 'num', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-semibold"
                    placeholder="Enter value"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <input
                    value={stat.label}
                    onChange={(e) => handleChange(index, 'label', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemoveStat(index)}
                className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors sm:mt-8 self-end sm:self-auto"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {stats.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 mt-4">
            <LayoutDashboard className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No stats added yet.</p>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
}
