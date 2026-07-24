import React from 'react';
import { RadioTower, CheckCircle, AlertTriangle, XCircle, Power } from 'lucide-react';

const sources = [
  {
    id: 1,
    name: 'Times of India (TOI)',
    type: 'RSS Live Feed',
    status: 'active',
    lastSync: '2 mins ago',
    description: 'National breaking news pipeline via RSS feed.',
  },
  {
    id: 2,
    name: 'Gemini AI Intelligence',
    type: 'REST API',
    status: 'rate_limited',
    lastSync: '15 mins ago',
    description: 'Geolocation and intelligence parsing. Free tier quota exceeded.',
  },
  {
    id: 3,
    name: 'Pollinations AI',
    type: 'Image Generation API',
    status: 'active',
    lastSync: '2 mins ago',
    description: 'Generates photorealistic incident context images on the fly.',
  },
  {
    id: 4,
    name: 'Twitter/X Firehose',
    type: 'WebSocket',
    status: 'offline',
    lastSync: 'Never',
    description: 'Real-time social media sentiment analysis. Waiting on API keys.',
  }
];

const StatusBadge = ({ status }) => {
  if (status === 'active') return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>;
  if (status === 'rate_limited') return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Rate Limited</span>;
  return <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> Offline</span>;
};

export function Sources() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
        <RadioTower className="text-indigo-400" />
        Data Sources Configuration
      </h1>
      <p className="text-slate-400 mb-8">Manage your live intelligence feeds, API integrations, and system connectivity.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map(s => (
          <div key={s.id} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-200">{s.name}</h3>
                <span className="text-xs text-indigo-400 font-medium tracking-wider uppercase">{s.type}</span>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-slate-400 text-sm mb-6">{s.description}</p>
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
              <span className="text-xs text-slate-500">Last Sync: {s.lastSync}</span>
              <button className={`p-2 rounded-lg transition-colors ${s.status === 'offline' ? 'bg-slate-700 text-slate-500' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}>
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
