import React from 'react';
import { motion } from 'framer-motion';

export function DummyPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-8 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-100">{title}</h1>
        <p className="text-slate-400 mt-2">{description}</p>
      </motion.div>
      <div className="flex-1 mt-8 border border-slate-700/50 rounded-xl bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
        <p className="text-slate-500 italic">Content for {title} will go here.</p>
      </div>
    </div>
  );
}
