import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';
import { AlertTriangle } from 'lucide-react';

interface Incident {
  id: number;
  title: string;
  severity: number;
  created_at: string;
}

interface AlertsContextType {
  unreadCount: number;
  clearUnread: () => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();
  
  // Track IDs we've already seen to avoid duplicate alerts
  const seenIncidentIds = useRef<Set<number>>(new Set());
  
  // Track first load so we don't alert on historical incidents on initial render
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const pollIncidents = async () => {
      try {
        const response = await apiClient.get<Incident[]>('/incidents?limit=10');
        const incidents = response.data;
        
        let newCriticalAlerts = 0;

        incidents.forEach(incident => {
          if (!seenIncidentIds.current.has(incident.id)) {
            seenIncidentIds.current.add(incident.id);
            
            // Only trigger popup for new incidents if it's NOT the first load
            if (!isFirstLoad.current) {
              if (incident.severity >= 4.0) {
                newCriticalAlerts++;
                
                toast.error(
                  <div className="flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> 
                      CRITICAL THREAT DETECTED
                    </span>
                    <span className="text-sm">{incident.title}</span>
                  </div>,
                  {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                  }
                );
              }
            }
          }
        });

        if (newCriticalAlerts > 0) {
          setUnreadCount(prev => prev + newCriticalAlerts);
        }
        
        isFirstLoad.current = false;
      } catch (err) {
        console.error("Error polling for alerts", err);
      }
    };

    pollIncidents();
    const interval = setInterval(pollIncidents, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const clearUnread = () => setUnreadCount(0);

  return (
    <AlertsContext.Provider value={{ unreadCount, clearUnread }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
