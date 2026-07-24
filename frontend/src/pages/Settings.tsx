import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, User, Palette, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [mapStyle, setMapStyle] = useState(localStorage.getItem('mapStyle') || 'dark');

  const handleMapStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMapStyle(e.target.value);
    localStorage.setItem('mapStyle', e.target.value);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <SettingsIcon className="text-indigo-400 w-6 h-6" />
        </div>
        System Settings
      </h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <User className="text-indigo-400" /> Account Profile
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <input type="text" disabled value={user?.email || 'admin@sentinelai.gov'} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-slate-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Access Role</label>
              <input type="text" disabled value={user?.role || 'Administrator'} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-slate-300 capitalize" />
            </div>
          </div>
        </div>

        {/* AI & Alerting Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Bell className="text-indigo-400" /> Alert Thresholds
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-slate-200">Minimum Severity Alert</h3>
                <p className="text-sm text-slate-400">Only notify for incidents above this level.</p>
              </div>
              <select className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg p-2">
                <option>Level 3 (Moderate)</option>
                <option selected>Level 4 (Severe)</option>
                <option>Level 5 (Critical)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-slate-200">AI Confidence Filter</h3>
                <p className="text-sm text-slate-400">Hide unverified incidents below this confidence score.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="range" min="50" max="99" defaultValue="85" className="accent-indigo-500" />
                <span className="text-slate-300 font-bold">85%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Configuration Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <MapIcon className="text-indigo-400" /> Map Configuration
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-slate-200">Default Map Style</h3>
                <p className="text-sm text-slate-400">Choose the basemap layer for the Live Map.</p>
              </div>
              <select 
                value={mapStyle} 
                onChange={handleMapStyleChange} 
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="dark">Dark Mode (Tactical)</option>
                <option value="satellite">Satellite Imagery</option>
                <option value="street">Street View</option>
              </select>
            </div>
          </div>
        </div>

        {/* Aesthetics Section */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Palette className="text-indigo-400" /> UI Aesthetics
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-slate-900/80 border-2 border-indigo-500 rounded-xl cursor-pointer text-center">
              <span className="block font-bold text-slate-200">Dark Glassmorphism</span>
              <span className="text-xs text-indigo-400 mt-1 block">Active</span>
            </div>
            <div className="flex-1 p-4 bg-slate-200/10 border border-slate-700 rounded-xl cursor-not-allowed opacity-50 text-center">
              <span className="block font-bold text-slate-400">Light Mode</span>
              <span className="text-xs text-slate-500 mt-1 block">Coming Soon</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
