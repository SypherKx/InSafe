'use client';

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { Contact, Report, User, Emergency } from '@/types';

type AppState = {
  user: User;
  contacts: Contact[];
  reports: Report[];
  emergency: Emergency;
  channels: { whatsapp: boolean; sms: boolean; email: boolean };
  message: string;
  shareLocation: boolean;
  currentLocation?: { lat: number; lng: number } | null;
  locationPermission: boolean;
};

type AppContextValue = {
  state: AppState;
  update: (patch: Partial<AppState>) => void;
  notice: string;
  notify: (text: string) => void;
  triggerSOS: () => Promise<void>;
  endEmergency: () => void;
  requestLocation: () => Promise<boolean>;
};

const initial: AppState = {
  user: {
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    gender: 'female',
    avatar: 'f1',
    email: 'priya.sharma@example.com',
    onboarded: true,
  },
  contacts: [
    { id: '1', name: 'Maa (Mother)', phone: '+91 98765 43210', relation: 'Mother', primary: true, alerts: true, location: true, avatar: 'f2' },
    { id: '2', name: 'Papa (Father)', phone: '+91 98765 43211', relation: 'Father', primary: false, alerts: true, location: true, avatar: 'm2' },
    { id: '3', name: 'Police Emergency (112)', phone: '112', relation: 'Emergency', primary: false, alerts: true, location: true, avatar: 'o2' },
    { id: '4', name: 'Women Helpline (1091)', phone: '1091', relation: 'Helpline', primary: false, alerts: true, location: false, avatar: 'f3' },
  ],
  reports: [
    { id: '1', category: 'Poor lighting', description: 'Street lights not working near Church Street.', severity: 'Medium' },
    { id: '2', category: 'Unsafe area', description: 'Reported near Brigade Road.', severity: 'High' },
    { id: '3', category: 'Harassment', description: 'Reported near MG Road.', severity: 'Medium' },
  ],
  emergency: { active: false, trigger: 'sos' },
  channels: { whatsapp: true, sms: true, email: false },
  message: '🚨 EMERGENCY ALERT - InSafe\nI need immediate help!\n\n📍 My Live Location: {{maps_link}}\nCoordinates: {{location}}\n🕐 Sent at {{timestamp}}.',
  shareLocation: true,
  currentLocation: { lat: 28.6315, lng: 77.2167 },
  locationPermission: true,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [notice, setNotice] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('insafe-app-v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          ...parsed,
          user: { ...prev.user, ...parsed.user },
          contacts: parsed.contacts?.length ? parsed.contacts : prev.contacts,
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('insafe-app-v3', JSON.stringify(state));
    } catch {}
  }, [state]);

  const update = (patch: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };

      // Check if emergency status just activated
      if (patch.emergency?.active && !prev.emergency.active) {
        dispatchAutomatedSOS(next, false);
        startWhatsAppLoop(next);
      } else if (patch.emergency && !patch.emergency.active && prev.emergency.active) {
        stopWhatsAppLoop();
      }

      return next;
    });
  };

  const notify = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 3200);
  };

  const requestLocation = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return true;
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, locationPermission: true }));
      return true;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState(prev => ({
            ...prev,
            currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            locationPermission: true,
          }));
          resolve(true);
        },
        () => {
          // Zero alert silent fallback to New Delhi
          setState(prev => ({
            ...prev,
            currentLocation: prev.currentLocation || { lat: 28.6315, lng: 77.2167 },
            locationPermission: true,
          }));
          resolve(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const dispatchAutomatedSOS = async (currentState: AppState, isUpdate: boolean) => {
    const lat = currentState.currentLocation?.lat || 28.6315;
    const lng = currentState.currentLocation?.lng || 77.2167;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const timestamp = new Date().toISOString();

    const formattedMessage = currentState.message
      .replace(/\{\{location\}\}/g, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .replace(/\{\{maps_link\}\}/g, mapsLink)
      .replace(/\{\{timestamp\}\}/g, new Date(timestamp).toLocaleTimeString());

    try {
      await fetch('/api/sos-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: currentState.contacts.filter(c => c.alerts),
          message: formattedMessage,
          location: { lat, lng },
          eventId: 'ev_' + Date.now(),
          timestamp,
          isUpdate,
        }),
      });
    } catch (e) {
      console.error('Automated WhatsApp dispatch:', e);
    }
  };

  const startWhatsAppLoop = (currentState: AppState) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Auto-update every 1 minute (60,000ms)
    intervalRef.current = setInterval(() => {
      dispatchAutomatedSOS(currentState, true);
    }, 60000);
  };

  const stopWhatsAppLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const triggerSOS = async () => {
    update({ emergency: { active: true, trigger: 'sos' } });
  };

  const endEmergency = () => {
    update({ emergency: { active: false, trigger: 'sos' } });
  };

  return (
    <AppContext.Provider value={{ state, update, notice, notify, triggerSOS, endEmergency, requestLocation }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider missing');
  return context;
}
