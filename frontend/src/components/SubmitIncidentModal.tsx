import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertTriangle, Loader2, BrainCircuit } from 'lucide-react';
import apiClient from '../api/client';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitIncidentModal({ isOpen, onClose, onSuccess }: SubmitModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Security Threat',
    description: '',
    latitude: 28.6139,
    longitude: 77.2090
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await apiClient.post('/incidents', formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        category: 'Security Threat',
        description: '',
        latitude: 28.6139,
        longitude: 77.2090
      });
    } catch (err) {
      console.error(err);
      setError('Failed to submit incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-rose-500 w-5 h-5" />
                Report Field Intelligence
              </h2>
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Incident Title
                </label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Armed robbery at main bank branch"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option>Security Threat</option>
                  <option>Natural Disaster</option>
                  <option>Civil Unrest</option>
                  <option>Traffic Accident</option>
                  <option>Industrial Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Field Report (Description)
                </label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Provide detailed intelligence..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input 
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input 
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-indigo-300" />
                        Gemini is analyzing...
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Submit to Sentinel Network
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
