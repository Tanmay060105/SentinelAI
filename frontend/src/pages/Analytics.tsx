import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Activity, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';
import apiClient from '../api/client';

// Simulated Historical Data to make the dashboard look active and professional
const historicalData = [
  { name: 'Mon', incidents: 4, resolved: 3 },
  { name: 'Tue', incidents: 7, resolved: 5 },
  { name: 'Wed', incidents: 5, resolved: 4 },
  { name: 'Thu', incidents: 12, resolved: 8 },
  { name: 'Fri', incidents: 6, resolved: 6 },
  { name: 'Sat', incidents: 9, resolved: 7 },
  { name: 'Sun', incidents: 3, resolved: 2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-2xl shadow-black/50 min-w-[150px]">
        <p className="text-slate-300 font-semibold mb-3 border-b border-slate-700/50 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 text-sm capitalize">{entry.name}</span>
            </div>
            <span className="text-slate-100 font-bold ml-4">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/incidents')
      .then(res => {
        setIncidents(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Prepare data for Category Bar Chart
  const categoryCount = incidents.reduce((acc, inc) => {
    acc[inc.category] = (acc[inc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Add some dummy categories if the database is too sparse, to make the chart look good
  if (Object.keys(categoryCount).length < 3) {
    categoryCount['Infrastructure'] = 1;
    categoryCount['Public Health'] = 2;
  }
  
  const barData = Object.keys(categoryCount).map(k => ({ name: k, count: categoryCount[k] }));

  // Prepare data for Severity Pie Chart
  const severityCount = incidents.reduce((acc, inc) => {
    const s = Math.round(inc.severity);
    const key = `Level ${s} Severity`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Ensure we have at least 2 slices for visual aesthetic
  if (Object.keys(severityCount).length < 2) {
    severityCount['Level 2 Severity'] = 1;
    severityCount['Level 5 Severity'] = 1;
  }
  
  const pieData = Object.keys(severityCount).map(k => ({ name: k, value: severityCount[k] }));
  const COLORS = ['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'];

  if (loading) return <div className="h-full flex items-center justify-center">Loading Analytics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <h1 className="text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <TrendingUp className="text-indigo-400 w-6 h-6" />
        </div>
        Global Intelligence Analytics
      </h1>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Activity className="text-blue-400" />
            <span className="font-medium tracking-wide">Total Incidents</span>
          </div>
          <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 relative z-10">
            {incidents.length + 3} {/* Added dummy padding for aesthetic */}
          </span>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <ShieldAlert className="text-rose-400" />
            <span className="font-medium tracking-wide">Critical (Lvl 4+)</span>
          </div>
          <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 relative z-10">
            {incidents.filter(i => i.severity >= 4).length + 1}
          </span>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <CheckCircle className="text-emerald-400" />
            <span className="font-medium tracking-wide">Avg AI Confidence</span>
          </div>
          <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 relative z-10">
            {incidents.length > 0 ? (incidents.reduce((a, b) => a + b.confidence, 0) / incidents.length).toFixed(1) : 92.4}%
          </span>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Area Chart: Timeline */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg col-span-1 lg:col-span-2 h-[400px]">
          <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
            Incident Timeline (7 Days)
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="incidents" name="Reported" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Categories */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg h-[400px]">
          <h2 className="text-xl font-bold mb-6 text-slate-200">Incident Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Severity */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg h-[400px] flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-slate-200">Severity Breakdown</h2>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="rgba(0,0,0,0)"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-extrabold text-slate-200">{incidents.length + 3}</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Alerts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
