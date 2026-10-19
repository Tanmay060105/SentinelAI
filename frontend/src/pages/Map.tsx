import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, Activity, X, Newspaper, BrainCircuit, ExternalLink, Plus, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../api/client';
import L from 'leaflet';
import { SubmitIncidentModal } from '../components/SubmitIncidentModal';
import { HeatmapLayer } from '../components/HeatmapLayer';
import { PlaybookModal } from '../components/PlaybookModal';
import { Layers } from 'lucide-react';
import { toast } from 'react-toastify';

interface Incident {
  id: number;
  title: string;
  category: string;
  description: string;
  severity: number;
  confidence: number;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  ai_summary?: string;
  news_headline?: string;
  image_keywords?: string;
  source_link?: string;
}

// Custom pulsing icons
const createRadarIcon = (severity: number) => {
  const isHighSeverity = severity >= 4.0;
  return L.divIcon({
    className: `radar-beacon ${isHighSeverity ? '' : 'yellow-beacon'}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map zooming to selected incident
function MapController({ selectedIncident }: { selectedIncident: Incident | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedIncident) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 12, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedIncident, map]);
  return null;
}

export function Map() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showDetailedSummary, setShowDetailedSummary] = useState(false);
  const [mapStyle, setMapStyle] = useState(localStorage.getItem('mapStyle') || 'dark');
  const [syncMessage, setSyncMessage] = useState("");
  const [viewMode, setViewMode] = useState<'pins' | 'heatmap'>('pins');
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [countriesData, setCountriesData] = useState<any>(null);
  const [statesData, setStatesData] = useState<any>(null);

  const fetchIncidents = async () => {
    try {
      const response = await apiClient.get('/incidents');
      const fetchedIncidents = response.data;
      setIncidents(fetchedIncidents);

      // Check for new high-severity incidents
      const notifiedIds = new Set(JSON.parse(localStorage.getItem('notifiedIncidentIds') || '[]'));
      let hasNewNotifications = false;

      fetchedIncidents.forEach((incident: Incident) => {
        if (incident.severity >= 4.5 && !notifiedIds.has(incident.id)) {
          toast.error(`CRITICAL THREAT DETECTED: ${incident.title}`, {
            icon: '🚨',
            autoClose: 10000,
            style: { border: '1px solid #ef4444', backgroundColor: '#450a0a' }
          });
          notifiedIds.add(incident.id);
          hasNewNotifications = true;
        }
      });

      if (hasNewNotifications) {
        localStorage.setItem('notifiedIncidentIds', JSON.stringify(Array.from(notifiedIds)));
      }
    } catch (error) {
      console.error("Failed to fetch incidents", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/countries.json')
      .then(res => res.json())
      .then(data => setCountriesData(data))
      .catch(err => console.error("Could not load country outlines:", err));

    fetch('/india_states.json')
      .then(res => res.json())
      .then(data => setStatesData(data))
      .catch(err => console.error("Could not load state outlines:", err));
  }, []);

  let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  if (mapStyle === 'street') {
    tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  } else if (mapStyle === 'dark_canvas') {
    tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
  }

  return (
    <div className="h-full w-full flex relative overflow-hidden">
      {/* Sidebar List */}
      <div className="w-[350px] h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col p-4 overflow-y-auto z-10 shadow-2xl flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Live Feed
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                setIsSyncing(true);
                setSyncMessage("Syncing in background...");
                try {
                  const res = await apiClient.post('/sync-news');
                  setSyncMessage(res.data.message);
                  await fetchIncidents();
                  setTimeout(() => setSyncMessage(""), 10000); // clear after 10s
                } catch (e) {
                  console.error(e);
                  setSyncMessage("Failed to start sync.");
                  setTimeout(() => setSyncMessage(""), 5000);
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
              title="Sync Live News"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsSubmitModalOpen(true)}
              className="p-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors"
              title="Report New Incident"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {syncMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg"
            >
              {syncMessage}
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-slate-400 text-sm">No incidents currently reported.</p>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <motion.div 
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedIncident(incident)}
                className={`bg-slate-800/60 p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedIncident?.id === incident.id 
                    ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'border-slate-700 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-md uppercase tracking-wider">
                    {incident.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    incident.severity >= 4 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    Lvl {incident.severity}
                  </span>
                </div>
                <h3 className="text-slate-200 font-medium mb-1">{incident.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{incident.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                  <span className="flex items-center gap-1 text-emerald-500/80">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Main Map */}
      <div className="flex-1 h-full relative z-0" style={{ backgroundColor: '#0B0F19' }}>
        <MapContainer 
          center={[22.5937, 78.9629]} 
          zoom={5} 
          className="w-full h-full bg-slate-950"
          style={{ background: '#0B0F19', backgroundColor: '#0B0F19' }}
          zoomControl={false}
        >
          <MapController selectedIncident={selectedIncident} />
          <TileLayer
            className="tactical-dark-satellite"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url={tileUrl}
          />
          {countriesData && (
            <GeoJSON 
              data={countriesData} 
              style={{
                fillColor: '#000000',
                fillOpacity: 0.1,
                color: '#10b981',
                weight: 1.5,
                opacity: 0.85,
              }}
              onEachFeature={(feature, layer) => {
                if (feature.properties?.NAME) {
                  layer.bindTooltip(feature.properties.NAME, {
                    className: 'tactical-tooltip-green',
                    sticky: true,
                    direction: 'top'
                  });
                }
                layer.on({
                  mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({
                      weight: 2.5,
                      color: '#00ff88',
                      fillColor: '#10b981',
                      fillOpacity: 0.25,
                    });
                    l.bringToFront();
                  },
                  mouseout: (e) => {
                    const l = e.target;
                    l.setStyle({
                      fillColor: '#000000',
                      fillOpacity: 0.1,
                      color: '#10b981',
                      weight: 1.5,
                      opacity: 0.85,
                    });
                  }
                });
              }}
            />
          )}
          {statesData && (
            <GeoJSON 
              data={statesData} 
              style={{
                fillColor: '#10b981',
                fillOpacity: 0.06,
                color: '#34d399',
                weight: 1.4,
                opacity: 0.9,
                dashArray: '3, 4',
              }}
              onEachFeature={(feature, layer) => {
                const stateName = feature.properties?.st_nm || feature.properties?.NAME;
                if (stateName) {
                  layer.bindTooltip(`STATE: ${stateName.toUpperCase()}`, {
                    className: 'tactical-tooltip-green',
                    sticky: true,
                    direction: 'top'
                  });
                }
                layer.on({
                  mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({
                      weight: 2.8,
                      color: '#00ff88',
                      fillColor: '#10b981',
                      fillOpacity: 0.4,
                      dashArray: '',
                    });
                    l.bringToFront();
                  },
                  mouseout: (e) => {
                    const l = e.target;
                    l.setStyle({
                      fillColor: '#10b981',
                      fillOpacity: 0.06,
                      color: '#34d399',
                      weight: 1.4,
                      opacity: 0.9,
                      dashArray: '3, 4',
                    });
                  }
                });
              }}
            />
          )}
          <TileLayer
            className="tactical-label-tiles"
            attribution=""
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />
          {viewMode === 'heatmap' && (
            <HeatmapLayer 
              points={incidents.map(inc => [inc.latitude, inc.longitude, inc.severity / 2.0] as [number, number, number])} 
            />
          )}
          {viewMode === 'pins' && incidents.map((incident) => (
            <Marker 
              key={incident.id} 
              position={[incident.latitude, incident.longitude]}
              icon={createRadarIcon(incident.severity)}
              eventHandlers={{
                click: () => {
                  setSelectedIncident(incident);
                  setShowDetailedSummary(false); // Reset on new selection
                }
              }}
            />
          ))}
        </MapContainer>

        {/* View Mode Toggle */}
        <div className="absolute top-4 right-4 z-[400]">
          <button 
            onClick={() => setViewMode(viewMode === 'pins' ? 'heatmap' : 'pins')}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-xl backdrop-blur-md border border-slate-700 shadow-xl transition-all"
          >
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm">
              {viewMode === 'pins' ? 'Switch to Heatmap' : 'Switch to Pins'}
            </span>
          </button>
        </div>
      </div>

      {/* Detailed Intelligence Slide-Out Panel */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-[450px] bg-slate-900/95 backdrop-blur-3xl border-l border-slate-700/50 shadow-2xl z-20 flex flex-col overflow-y-auto"
          >
            <div className="p-6">
              <button 
                onClick={() => setSelectedIncident(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mt-8 mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-widest ${
                  selectedIncident.severity >= 4 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  SEVERITY LEVEL {selectedIncident.severity}
                </span>
                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{selectedIncident.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" /> {selectedIncident.category}
                  </span>
                  <span>•</span>
                  <span>{new Date(selectedIncident.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Simulated News Image */}
              <div className="w-full h-48 bg-slate-800 rounded-xl mb-6 overflow-hidden relative border border-slate-700">
                <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 z-10 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                <img 
                  src={selectedIncident.image_keywords?.startsWith('http') 
                    ? selectedIncident.image_keywords 
                    : `https://image.pollinations.ai/prompt/photorealistic%20news%20photography%20of%20${encodeURIComponent(selectedIncident.image_keywords || selectedIncident.category)}?width=400&height=300&nologo=true&seed=${selectedIncident.id}`
                  }
                  alt="Context"
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // prevent infinite loops
                    // If the RSS image fails (which happens often), fall back to an AI generated image based on the category
                    e.currentTarget.src = `https://image.pollinations.ai/prompt/photorealistic%20news%20photography%20of%20${encodeURIComponent(selectedIncident.category)}%20crisis%20event?width=400&height=300&nologo=true&seed=${selectedIncident.id}`;
                  }}
                />
              </div>

              {/* Headline */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 tracking-wider">LIVE NEWS HEADLINE</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 leading-tight">
                  "{selectedIncident.news_headline || selectedIncident.title}"
                </h3>
              </div>

              {/* AI Analysis */}
              <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5 mb-6 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <BrainCircuit className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Gemini Intelligence</span>
                  </div>
                  <div className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-1 rounded">
                    CONFIDENCE: {selectedIncident.confidence}%
                  </div>
                </div>
                <p className="text-indigo-100/90 text-sm leading-relaxed">
                  {selectedIncident.ai_summary || selectedIncident.description}
                </p>
              </div>

              {/* Raw Report Toggle */}
              <div className="mb-6">
                <button 
                  onClick={() => setShowDetailedSummary(!showDetailedSummary)}
                  className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors border border-slate-700"
                >
                  <span className="font-semibold text-slate-300">View Detailed Summary</span>
                  {showDetailedSummary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {showDetailedSummary && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 mt-2 bg-slate-800/50 rounded-xl border border-slate-700/50 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {selectedIncident.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex gap-3 mt-8">
                {selectedIncident.source_link && (
                  <a 
                    href={selectedIncident.source_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
                  >
                    Source <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button 
                  onClick={() => setIsPlaybookOpen(true)}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Deploy Response <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubmitIncidentModal 
        isOpen={isSubmitModalOpen} 
        onClose={() => setIsSubmitModalOpen(false)} 
        onSuccess={() => {
          fetchIncidents(); // Refresh immediately
        }}
      />
      
      <PlaybookModal 
        isOpen={isPlaybookOpen}
        onClose={() => setIsPlaybookOpen(false)}
        incidentId={selectedIncident?.id || null}
        incidentTitle={selectedIncident?.title || ""}
      />
    </div>
  );
}
