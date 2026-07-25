import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '../api/client';

interface PlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: number | null;
  incidentTitle: string;
}

export function PlaybookModal({ isOpen, onClose, incidentId, incidentTitle }: PlaybookModalProps) {
  const [playbookMd, setPlaybookMd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && incidentId) {
      setIsLoading(true);
      setPlaybookMd(null);
      
      apiClient.get(`/incidents/${incidentId}/playbook`)
        .then((res) => {
          setPlaybookMd(res.data.markdown_content);
        })
        .catch((err) => {
          console.error("Failed to generate playbook", err);
          setPlaybookMd("Failed to connect to Command Center. Playbook unavailable.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, incidentId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              Tactical Playbook
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-900">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Incident</h3>
              <p className="text-slate-200">{incidentTitle}</p>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-inner min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-indigo-400 gap-4 py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Generating tactical response via Gemini AI...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                  {playbookMd && <ReactMarkdown remarkPlugins={[remarkGfm]}>{playbookMd}</ReactMarkdown>}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
             <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close
              </button>
              <button 
                className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                Execute Plan
              </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
