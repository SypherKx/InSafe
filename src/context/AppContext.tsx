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
    name: '',
    phone: '',
    gender: 'female',
    avatar: '/images/profile-female.jpg',
    email: '',
    onboarded: false,
  },
  contacts: [],
  reports: [
    { id: '1', category: 'Poor lighting', description: 'Street lights not working near Church Street.', severity: 'Medium' },
    { id: '2', category: 'Unsafe area', description: 'Reported near Brigade Road.', severity: 'High' },
    { id: '3', category: 'Harassment', description: 'Reported near MG Road.', severity: 'Medium' },
  ],
  emergency: { active: false, trigger: 'sos' },
  channels: { whatsapp: true, sms: true, email: false },
  message: '🚨 EMERGENCY ALERT - InSafe\nI need immediate help!\n\n📍 My Live Location: {{maps_link}}\nCoordinates: {{location}}\n🕐 Sent at {{timestamp}}.',
  shareLocation: true,
  currentLocation: { lat: 26.4652, lng: 80.3498 },
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
        // Discard legacy hardcoded Delhi location if present
        const isOldDelhi = parsed.currentLocation &&
          Math.abs(parsed.currentLocation.lat - 28.6315) < 0.005 &&
          Math.abs(parsed.currentLocation.lng - 77.2167) < 0.005;

        // Discard any legacy dummy/fake placeholder contacts
        const isDummy = (c: any) =>
          !c ||
          c.phone === '+91 98765 43210' ||
          c.phone === '+91 98765 43211' ||
          c.phone === '112' ||
          c.phone === '1091' ||
          c.name?.includes('Maa') ||
          c.name?.includes('Papa') ||
          c.name?.includes('Police') ||
          c.name?.includes('Helpline') ||
          c.name?.includes('Emergency SOS');

        const realContacts = Array.isArray(parsed.contacts)
          ? parsed.contacts.filter((c: any) => !isDummy(c))
          : [];

        setState(prev => ({
          ...prev,
          ...parsed,
          currentLocation: isOldDelhi ? { lat: 26.4652, lng: 80.3498 } : (parsed.currentLocation || prev.currentLocation),
          user: { ...prev.user, ...parsed.user },
          contacts: realContacts,
        }));
      }
    } catch {}

    // Automatically fetch real live hardware GPS / IP location on app mount
    requestLocation();
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

    return new Promise(async (resolve) => {
      // 1. Try Hardware GPS first with zero cache (maximumAge: 0)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setState(prev => ({
              ...prev,
              currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              locationPermission: true,
            }));
            resolve(true);
          },
          async () => {
            // 2. Dynamic real network IP fallback
            try {
              const res = await fetch('https://ipwho.is/');
              const data = await res.json();
              if (data && data.success && data.latitude && data.longitude) {
                setState(prev => ({
                  ...prev,
                  currentLocation: { lat: data.latitude, lng: data.longitude },
                  locationPermission: true,
                }));
                resolve(true);
                return;
              }
            } catch {}

            // Safe fallback
            setState(prev => ({
              ...prev,
              currentLocation: prev.currentLocation || { lat: 26.4652, lng: 80.3498 },
              locationPermission: true,
            }));
            resolve(true);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else {
        resolve(true);
      }
    });
  };

  const dispatchAutomatedSOS = async (currentState: AppState, isUpdate: boolean) => {
    const lat = currentState.currentLocation?.lat || 26.4652;
    const lng = currentState.currentLocation?.lng || 80.3498;
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
