import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Activity, Globe, Database, Crosshair, Radar } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  
  // Mouse tracking for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring physics for the tilt
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates between -0.5 and 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center overflow-hidden relative selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
    >
      {/* Background Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e511_1px,transparent_1px),linear-gradient(to_bottom,#4f46e511_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Main 3D Container */}
      <motion.div 
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d" 
        }}
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-6"
      >
        {/* Holographic Radar / Scanner Visual */}
        <motion.div 
          className="relative w-64 h-64 mb-12 flex items-center justify-center"
          style={{ transform: "translateZ(80px)" }}
        >
          {/* Outer Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-indigo-500/30 border-dashed"
          />
          
          {/* Inner Counter-Rotating Ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-2 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent opacity-80"
          />

          {/* Core Shield Logo */}
          <div className="relative z-10 bg-slate-900/50 backdrop-blur-md p-6 rounded-full border border-indigo-500/50 shadow-[0_0_50px_rgba(79,70,229,0.4)]">
            <Shield className="w-16 h-16 text-indigo-400" strokeWidth={1.5} />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl"
            />
          </div>

          {/* Radar Sweep Effect */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(79,70,229,0.3)_360deg)]"
            style={{ transformOrigin: "center" }}
          />
          
          {/* Scanning crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-[1px] bg-indigo-500" />
            <div className="h-full w-[1px] bg-indigo-500 absolute" />
          </div>
        </motion.div>

        {/* Hero Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
          style={{ transform: "translateZ(100px)" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold tracking-widest mb-6">
            <Activity className="w-4 h-4" />
            SYSTEM ONLINE
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Sentinel</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400 drop-shadow-[0_0_25px_rgba(79,70,229,0.5)]">AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
            The next generation of <span className="text-slate-200">predictive crisis intelligence</span> and autonomous tactical response.
          </p>
        </motion.div>

        {/* Interactive Action Button */}
        <motion.div style={{ transform: "translateZ(120px)" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-xl"
          >
            {/* Button Background Gradient & Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-50 transition-opacity group-hover:opacity-80" />
            
            {/* Button Content */}
            <div className="relative z-10 flex items-center gap-3 text-lg font-bold tracking-wide">
              INITIALIZE COMMAND CENTER
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            
            {/* Button Border Shine Effect */}
            <div className="absolute inset-0 border border-white/20 rounded-xl z-20 pointer-events-none" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Futuristic HUD Elements (Edges) */}
      <div className="absolute top-8 left-8 text-indigo-500/40 font-mono text-xs hidden md:block">
        <div>SYS.LAT: 12ms</div>
        <div>NET.STAT: OPTIMAL</div>
      </div>
      <div className="absolute bottom-8 right-8 text-indigo-500/40 font-mono text-xs hidden md:block text-right">
        <div>CORE: v2.4.1</div>
        <div>UPLINK: SECURE</div>
      </div>
      <div className="absolute top-8 right-8 text-indigo-500/40 hidden md:block">
        <Crosshair className="w-6 h-6 opacity-50" />
      </div>
    </div>
  );
}
