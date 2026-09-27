'use client';

import React, { useEffect, useState, useRef, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from '@/lib/router-adapter';
import {
  ArrowLeft, ArrowRight, Bell, Check, ChevronRight, Clock3,
  LogOut, Mail, MapPin, Megaphone, MessageCircle, Phone,
  PhoneCall, PhoneOff, Plus, Settings, ShieldCheck, Siren,
  Trash2, UserRound, Users, VolumeX, X, Sparkles, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { AVATAR_OPTIONS, getAvatarById, type AvatarOption } from '@/lib/avatars';
import type { Contact } from '@/types';

const splash = '/images/splash-hero.jpg';

export function getProfilePhotoByGender(gender?: string): string {
  if (gender === 'male') return '/images/profile-male.jpg';
  if (gender === 'other' || gender === 'non-binary') return '/images/profile-other.jpg';
  return '/images/profile-female.jpg';
}

// Helper to render real profile picture cleanly
export function UserAvatar({
  gender = 'female',
  src,
  avatarId,
  size = 46,
  className = ''
}: {
  gender?: string;
  src?: string;
  avatarId?: string;
  size?: number;
  className?: string;
}) {
  const photo =
    src ||
    (avatarId && avatarId.startsWith('/images/') ? avatarId : null) ||
    getProfilePhotoByGender(
      gender || (avatarId?.startsWith('m') ? 'male' : avatarId?.startsWith('nb') || avatarId?.startsWith('o') ? 'other' : 'female')
    );

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
      className={`rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md relative bg-muted select-none ${className}`}
    >
      <img
        src={photo}
        alt="Profile"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold text-xl ${light ? 'text-emergency-foreground' : 'text-brand'}`}>
      <ShieldCheck size={26} strokeWidth={2.5} /> InSafe
    </span>
  );
}

function Back({ to = '/dashboard' }: { to?: string }) {
  return (
    <Button variant="outline" size="square" asChild aria-label="Go back">
      <Link to={to}><ArrowLeft size={19} /></Link>
    </Button>
  );
}

function Page({ title, children, back = '/dashboard', soft = false, action }: { title: string; children: ReactNode; back?: string; soft?: boolean; action?: ReactNode }) {
  return (
    <main className={`screen page-enter ${soft ? 'screen-soft' : ''}`}>
      <div className="screen-top">
        <Back to={back} />
        {action}
      </div>
      <h1 className="screen-title">{title}</h1>
      {children}
    </main>
  );
}

function Primary({ children, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="pill" size="pill" className="w-full" {...props}>{children}</Button>;
}

function Notice() {
  const { notice } = useApp();
  return notice ? (
    <div role="status" className="fixed bottom-6 left-1/2 z-50 w-[min(90vw,380px)] -translate-x-1/2 rounded-2xl bg-primary px-5 py-4 text-center text-sm font-medium text-primary-foreground shadow-xl animate-fade-in">
      {notice}
    </div>
  ) : null;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onChange}
      className={`h-7 w-12 rounded-full p-1 transition-colors flex items-center ${checked ? 'bg-brand' : 'bg-muted'}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field" value={value} type={type} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </label>
  );
}

function GpsCrosshairIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="7" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

function MapVisual({ incidents = false }: { incidents?: boolean }) {
  const { state, update, notify } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const userPinnedRef = useRef(false);

  const [locating, setLocating] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState('Locating your position...');
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isCustomPinned, setIsCustomPinned] = useState(false);

  const initialLat = state.currentLocation?.lat || 26.4652;
  const initialLng = state.currentLocation?.lng || 80.3498;

  const reverseGeocode = async (latitude: number, longitude: number, acc?: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const a = data.address || {};
        const road = a.road || a.pedestrian || a.suburb || a.neighbourhood || a.residential;
        const city = a.city || a.town || a.county || a.state_district || a.state || 'Kanpur';
        const display = road ? `${road}, ${city}` : `${city}, India`;
        setDetectedAddress(display);
        return display;
      }
    } catch {}
    const fallback = `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;
    setDetectedAddress(fallback);
    return fallback;
  };

  useEffect(() => {
    let isMounted = true;
    let watchId: number | null = null;

    async function setupMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const curLat = state.currentLocation?.lat || 26.4652;
      const curLng = state.currentLocation?.lng || 80.3498;

      const map = L.map(mapContainerRef.current, {
        center: [curLat, curLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Fast, high-clarity OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Force recalculate dimensions once rendered
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      // Custom Glowing InSafe Safety Pin Icon
      const pinIcon = L.divIcon({
        className: 'insafe-leaflet-pin',
        html: `
          <div style="position:relative; width:44px; height:54px; margin-left:-22px; margin-top:-52px; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.35)); cursor:grab;">
            <svg width="44" height="54" viewBox="0 0 42 52" fill="none">
              <path d="M21 0C9.4 0 0 9.4 0 21c0 15.5 21 31 21 31s21-15.5 21-31C42 9.4 32.6 0 21 0z" fill="#00BA55"/>
              <path d="M21 2C10.5 2 2 10.5 2 21c0 3.2 0.8 6.2 2.2 8.8h33.6C39.2 27.2 40 24.2 40 21 40 10.5 31.5 2 21 2z" fill="#F59E0B"/>
              <circle cx="21" cy="20" r="11" fill="white"/>
              <path d="M21 13L14 16v5c0 4.3 3 8.3 7 9.3 4-1 7-5 7-9.3v-5l-7-3z" fill="#00BA55"/>
              <circle cx="21" cy="20" r="2.5" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [44, 54],
        iconAnchor: [22, 52],
      });

      // Draggable marker
      const marker = L.marker([curLat, curLng], {
        icon: pinIcon,
        draggable: true,
        title: 'Drag to adjust exact location',
      }).addTo(map);
      markerRef.current = marker;

      // Accuracy & Geofence Circle
      const circle = L.circle([curLat, curLng], {
        radius: 35,
        color: '#00BA55',
        fillColor: '#00BA55',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '4, 6',
      }).addTo(map);
      circleRef.current = circle;

      // Incidents markers if in SafeNet screen
      if (incidents) {
        const hazardIcon = L.divIcon({
          className: 'hazard-pin',
          html: `<div style="background:#EF4444; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; box-shadow:0 3px 8px rgba(239,68,68,0.5); border:2px solid white;">⚠️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const warningIcon = L.divIcon({
          className: 'warning-pin',
          html: `<div style="background:#F59E0B; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; box-shadow:0 3px 8px rgba(245,158,11,0.5); border:2px solid white;">🔔</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const safeIcon = L.divIcon({
          className: 'safe-pin',
          html: `<div style="background:#2563EB; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; box-shadow:0 3px 8px rgba(37,99,235,0.5); border:2px solid white;">🛡️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([curLat + 0.0025, curLng - 0.003], { icon: hazardIcon }).addTo(map);
        L.marker([curLat - 0.002, curLng + 0.0035], { icon: warningIcon }).addTo(map);
        L.marker([curLat + 0.0018, curLng + 0.0025], { icon: safeIcon }).addTo(map);
      }

      // Drag End Event: Updates exact location
      marker.on('dragend', async (e: any) => {
        userPinnedRef.current = true;
        setIsCustomPinned(true);
        const pos = e.target.getLatLng();
        circle.setLatLng(pos);
        update({ currentLocation: { lat: pos.lat, lng: pos.lng }, locationPermission: true });
        const addr = await reverseGeocode(pos.lat, pos.lng);
        notify(`📍 Exact location set: ${addr}`);
      });

      // Map Click Event: Taps anywhere to move exact pin
      map.on('click', async (e: any) => {
        userPinnedRef.current = true;
        setIsCustomPinned(true);
        marker.setLatLng(e.latlng);
        circle.setLatLng(e.latlng);
        update({ currentLocation: { lat: e.latlng.lat, lng: e.latlng.lng }, locationPermission: true });
        const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        notify(`📍 Pinned to: ${addr}`);
      });

      // Continuous high-precision hardware GPS watch
      if (typeof window !== 'undefined' && navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          async (pos) => {
            if (!isMounted) return;
            const newLat = pos.coords.latitude;
            const newLng = pos.coords.longitude;
            const acc = Math.round(pos.coords.accuracy);
            setAccuracyMeters(acc);

            if (circleRef.current) {
              circleRef.current.setRadius(Math.max(15, acc));
            }

            // If user hasn't manually pinned a spot, lock marker to live GPS
            if (!userPinnedRef.current && markerRef.current && mapInstanceRef.current) {
              markerRef.current.setLatLng([newLat, newLng]);
              circleRef.current?.setLatLng([newLat, newLng]);
              mapInstanceRef.current.panTo([newLat, newLng]);
              update({ currentLocation: { lat: newLat, lng: newLng }, locationPermission: true });
              reverseGeocode(newLat, newLng, acc);
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
        );
      }

      // Initial reverse geocode
      reverseGeocode(curLat, curLng);
    }

    setupMap();

    return () => {
      isMounted = false;
      if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [incidents]);

  const handleLocateMe = (silent = false) => {
    if (typeof window === 'undefined') return;
    setLocating(true);
    userPinnedRef.current = false;
    setIsCustomPinned(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLat = pos.coords.latitude;
          const newLng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);
          setAccuracyMeters(acc);

          if (markerRef.current) markerRef.current.setLatLng([newLat, newLng]);
          if (circleRef.current) {
            circleRef.current.setLatLng([newLat, newLng]);
            circleRef.current.setRadius(Math.max(15, acc));
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLat, newLng], 17, { duration: 1.2 });
          }

          update({
            currentLocation: { lat: newLat, lng: newLng },
            locationPermission: true,
          });

          const place = await reverseGeocode(newLat, newLng, acc);
          if (!silent) {
            notify(`📍 Live GPS Locked: ${place} (±${acc}m)`);
          }
          setLocating(false);
        },
        async () => {
          // Dynamic real network IP fallback
          try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.success && data.latitude && data.longitude) {
              const ipLat = data.latitude;
              const ipLng = data.longitude;

              if (markerRef.current) markerRef.current.setLatLng([ipLat, ipLng]);
              if (circleRef.current) {
                circleRef.current.setLatLng([ipLat, ipLng]);
                circleRef.current.setRadius(35);
              }
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([ipLat, ipLng], 15, { duration: 1.2 });
              }

              update({
                currentLocation: { lat: ipLat, lng: ipLng },
                locationPermission: true,
              });

              const cityLoc = `${data.city || 'Kanpur'}, ${data.region || 'Uttar Pradesh'}`;
              setDetectedAddress(cityLoc);
              if (!silent) {
                notify(`📍 Located via Network: ${cityLoc}`);
              }
            }
          } catch {}
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const targetLat = parseFloat(data[0].lat);
        const targetLng = parseFloat(data[0].lon);
        userPinnedRef.current = true;
        setIsCustomPinned(true);

        if (markerRef.current) markerRef.current.setLatLng([targetLat, targetLng]);
        if (circleRef.current) {
          circleRef.current.setLatLng([targetLat, targetLng]);
          circleRef.current.setRadius(25);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([targetLat, targetLng], 17, { duration: 1.2 });
        }

        update({
          currentLocation: { lat: targetLat, lng: targetLng },
          locationPermission: true,
        });

        const shortName = data[0].display_name.split(',').slice(0, 3).join(',');
        setDetectedAddress(shortName);
        setShowSearch(false);
        setSearchQuery('');
        notify(`📍 Map centered on ${shortName.split(',')[0]}`);
      } else {
        notify('Location not found. Try adding colony or city name.');
      }
    } catch {
      notify('Could not search location.');
    } finally {
      setSearchLoading(false);
    }
  };

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] ${incidents ? 'h-[390px]' : 'h-[330px]'}`}
      style={{ border: '1px solid rgba(226, 232, 240, 0.8)', background: '#F8FAFC' }}
    >
      {/* Real Interactive Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Floating Action Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          title="Search colony, street, or landmark"
          className="h-8 px-2.5 rounded-full bg-card/95 text-foreground shadow-md border border-border text-xs font-bold hover:bg-card active:scale-95 transition-all backdrop-blur-sm flex items-center gap-1 cursor-pointer"
        >
          🔍 <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => handleLocateMe(false)}
          disabled={locating}
          title="Locate my exact live position"
          className="h-8 px-3 rounded-full bg-card/95 text-foreground shadow-md border border-border text-xs font-bold hover:bg-card active:scale-95 transition-all backdrop-blur-sm flex items-center gap-1.5 cursor-pointer"
        >
          <GpsCrosshairIcon size={14} className={locating ? 'animate-spin text-brand' : 'text-brand'} />
          <span>{locating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Quick Search Popover */}
      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="absolute top-12 left-3 right-3 z-30 flex gap-1.5 bg-card/95 p-1.5 rounded-2xl shadow-xl border border-border backdrop-blur-md animate-fade-in">
          <input
            className="flex-1 h-8 px-3 text-xs bg-muted rounded-xl outline-none"
            placeholder="Search colony, street, or landmark in Kanpur/India..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="h-8 px-3 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand/90 cursor-pointer"
          >
            {searchLoading ? '...' : 'Go'}
          </button>
        </form>
      )}

      {/* Floating Zoom & Recenter Controls */}
      <div className="absolute top-12 right-3 z-20 flex flex-col gap-1.5 mt-1">
        <button
          type="button"
          onClick={zoomIn}
          title="Zoom in"
          className="w-8 h-8 rounded-xl bg-card/95 text-foreground shadow-md border border-border flex items-center justify-center font-bold text-sm hover:bg-card active:scale-95 transition-all backdrop-blur-sm cursor-pointer"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom out"
          className="w-8 h-8 rounded-xl bg-card/95 text-foreground shadow-md border border-border flex items-center justify-center font-bold text-sm hover:bg-card active:scale-95 transition-all backdrop-blur-sm cursor-pointer"
        >
          −
        </button>
      </div>

      {/* Top Left Helper Hint */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-card/90 text-foreground/80 shadow-sm border border-border/80 text-[10px] font-medium backdrop-blur-sm flex items-center gap-1">
          📍 Drag pin or tap to adjust exact gate
        </span>
      </div>

      {/* Bottom Floating Live Address Card */}
      <div className="absolute bottom-3 left-3 z-20 rounded-2xl bg-card/95 px-3 py-1.5 text-xs font-semibold shadow-md border border-border backdrop-blur-sm max-w-[300px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse shrink-0" />
          <span className="truncate">{detectedAddress}</span>
        </div>
        <div className="flex items-center gap-2 pl-3.5 mt-0.5 text-[10px] text-muted-foreground">
          {accuracyMeters ? (
            <span className="text-brand font-medium">±{accuracyMeters}m Accuracy</span>
          ) : (
            <span>GPS Tracking Active</span>
          )}
          {isCustomPinned && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">Custom Pin</span>
          )}
        </div>
      </div>

      {/* Bottom Right Re-center GPS button if custom pinned */}
      {isCustomPinned && (
        <button
          type="button"
          onClick={() => handleLocateMe(false)}
          title="Return to real-time live GPS tracking"
          className="absolute bottom-3 right-3 z-20 h-7 px-2.5 rounded-full bg-brand text-white shadow-md text-[11px] font-bold hover:bg-brand/90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          🔄 <span>Live GPS</span>
        </button>
      )}
    </div>
  );
}


// 1. SPLASH SCREEN (Enters directly into Setup/Dashboard)
export function Splash() {
  return (
    <main className="min-h-dvh bg-card page-enter flex flex-col justify-between">
      <div className="splash-photo">
        <img src={splash} alt="Indian woman confidently using her phone outdoors" />
        <span className="absolute bottom-7 left-7 z-10 text-[42px] font-extrabold leading-none text-emergency-foreground drop-shadow-md">
          Stay Safe
        </span>
      </div>
      <div className="px-7 pb-10 pt-4">
        <h1 className="text-[42px] font-extrabold leading-[1.1] text-muted-foreground">
          with <span className="text-brand">InSafe</span>
        </h1>
        <p className="mt-4 max-w-[290px] text-sm leading-6 text-muted-foreground">
          Feel confident wherever life takes you. No login friction required.
        </p>
        <Button variant="pill" size="pill" asChild className="mt-8 w-full">
          <Link to="/onboarding">Get Started <ArrowRight size={18}/></Link>
        </Button>
        <p className="mt-8 text-xs text-center text-muted-foreground">Safety is Freedom.</p>
      </div>
    </main>
  );
}

// 2. MULTI-STEP ONBOARDING SCREEN
// Step 1: Gender & Avatar -> Step 2: Name & Number -> Step 3: Contacts Permission -> Step 4: Add SOS Contacts -> Step 5: Location Permission -> Finish!
export function OnboardingScreen() {
  const { state, update, notify, requestLocation } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [gender, setGender] = useState<'female' | 'male' | 'other'>(
    (state.user.gender as any) === 'male' ? 'male' : (state.user.gender as any) === 'other' ? 'other' : 'female'
  );
  const [name, setName] = useState(state.user.name || '');
  const [phone, setPhone] = useState(state.user.phone || '');

  // Permission states
  const [contactsPermissionGranted, setContactsPermissionGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(state.locationPermission);
  const [locationLoading, setLocationLoading] = useState(false);

  // Emergency SOS Contacts
  const [contactsList, setContactsList] = useState<Contact[]>(
    state.contacts.length
      ? state.contacts
      : [
          { id: '1', name: 'Maa (Mom)', phone: '+91 98765 43210', relation: 'Mother', primary: true, alerts: true, location: true, avatar: '/images/profile-female.jpg' },
          { id: '2', name: 'Papa (Dad)', phone: '+91 98765 43211', relation: 'Father', primary: false, alerts: true, location: true, avatar: '/images/profile-male.jpg' }
        ]
  );

  // Add new contact inline
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');
  const [newContactGender, setNewContactGender] = useState<'female' | 'male' | 'other'>('female');

  const handleGenderChange = (g: 'female' | 'male' | 'other') => {
    setGender(g);
  };

  const handleAllowContacts = () => {
    setContactsPermissionGranted(true);
    notify('Contacts permission granted.');
    setStep(4);
  };

  const handleAddEmergencyContact = (e: FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const added: Contact = {
      id: String(Date.now()),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation,
      avatar: getProfilePhotoByGender(newContactGender),
      primary: contactsList.length === 0,
      alerts: true,
      location: true
    };
    setContactsList([...contactsList, added]);
    setNewContactName('');
    setNewContactPhone('');
    notify('Emergency contact added.');
  };

  const removeContact = (id: string) => {
    setContactsList(contactsList.filter(c => c.id !== id));
  };

  const handleAllowLocation = async () => {
    setLocationLoading(true);
    await requestLocation();
    setLocationGranted(true);
    setLocationLoading(false);
    notify('Location permission granted.');
    setStep(6);
  };

  const handleFinishSetup = () => {
    const finalName = name.trim() || (gender === 'female' ? 'Priya Sharma' : gender === 'male' ? 'Aryan Sharma' : 'Alex');
    const finalPhone = phone.trim() || '+91 98765 43210';
    const profilePic = getProfilePhotoByGender(gender);

    update({
      user: {
        name: finalName,
        phone: finalPhone,
        gender,
        avatar: profilePic,
        onboarded: true,
      },
      contacts: contactsList.length ? contactsList : [
        { id: '1', name: 'Emergency SOS Contact', phone: '+91 98765 43210', relation: 'Family', primary: true, alerts: true, location: true, avatar: '/images/profile-female.jpg' }
      ]
    });

    notify(`Welcome ${finalName}! InSafe protection is now active.`);
    navigate({ to: '/dashboard' });
  };

  return (
    <main className="screen screen-soft page-enter flex flex-col justify-between pb-8">
      <div>
        <div className="screen-top">
          {step > 1 ? (
            <Button variant="outline" size="square" onClick={() => setStep((s) => (s - 1) as any)}>
              <ArrowLeft size={19} />
            </Button>
          ) : (
            <Back to="/" />
          )}
          <Brand />
          <span className="text-xs font-bold text-muted-foreground">Step {step} of 6</span>
        </div>

        {/* Top Step Progress Bar */}
        <div className="w-full bg-border h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-brand h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* STEP 1: GENDER SELECTION & AUTO PHOTO */}
        {step === 1 && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 1 · Profile Photo & Gender</span>
              <h1 className="text-[28px] font-extrabold leading-tight mt-1 text-foreground">
                Select Your Gender
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Your profile picture automatically updates based on your gender selection.
              </p>
            </div>

            {/* Live Auto-Assigned Profile Photo Preview */}
            <div className="screen-card p-6 border border-border flex flex-col items-center justify-center text-center">
              <div className="relative">
                <UserAvatar gender={gender} size={112} className="ring-4 ring-brand/20 shadow-xl" />
                <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-brand p-1 text-primary-foreground shadow">
                  <ShieldCheck size={16}/>
                </span>
              </div>
              <h3 className="mt-3.5 font-extrabold text-base capitalize text-foreground">
                {gender === 'female' ? 'Female Profile' : gender === 'male' ? 'Male Profile' : 'Other / Non-Binary Profile'}
              </h3>
              <span className="mt-0.5 text-xs text-brand font-semibold flex items-center gap-1">
                <Sparkles size={13} /> Photo auto-assigned
              </span>
            </div>

            {/* 3 Gender Selection Cards */}
            <div>
              <span className="field-label">Choose Gender</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'female', label: 'Female', photo: '/images/profile-female.jpg' },
                  { id: 'male', label: 'Male', photo: '/images/profile-male.jpg' },
                  { id: 'other', label: 'Other', photo: '/images/profile-other.jpg' },
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGenderChange(g.id as any)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-xs font-bold ${
                      gender === g.id
                        ? 'border-brand bg-brand-soft text-brand shadow-md scale-105'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm mb-2">
                      <img src={g.photo} alt={g.label} className="w-full h-full object-cover" />
                    </div>
                    <span>{g.label}</span>
                    {gender === g.id && (
                      <span className="mt-1 text-[10px] bg-brand text-white px-2 py-0.5 rounded-full font-bold">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: NAME & PHONE */}
        {step === 2 && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 2 · Your Details</span>
              <h1 className="text-[28px] font-extrabold leading-tight mt-1 text-foreground">
                What should we call you?
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Your name and WhatsApp number will be attached to emergency alerts.
              </p>
            </div>

            <div className="space-y-4">
              <Field
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder={gender === 'female' ? 'e.g. Priya Sharma' : 'e.g. Aryan Sharma'}
                required
              />
              <Field
                label="Your WhatsApp Number"
                value={phone}
                onChange={setPhone}
                type="tel"
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: CONTACTS PERMISSION */}
        {step === 3 && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 3 · Permission</span>
              <h1 className="text-[28px] font-extrabold leading-tight mt-1 text-foreground">
                Contacts Access
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                InSafe needs contact access to alert your trusted circle automatically via WhatsApp.
              </p>
            </div>

            <div className="screen-card p-6 border border-border text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-soft text-brand grid place-items-center text-3xl shadow-sm mb-4">
                👥
              </div>
              <h2 className="text-lg font-bold text-foreground">Allow InSafe to access contacts?</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
                This allows you to select family and friends for single-tap automated WhatsApp SOS alerts.
              </p>

              <div className="mt-6 space-y-2.5">
                <Primary onClick={handleAllowContacts}>
                  <Check size={18} /> Allow Contacts Access
                </Primary>
                <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setStep(4)}>
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ADD EMERGENCY SOS CONTACTS */}
        {step === 4 && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 4 · Emergency Contacts</span>
              <h1 className="text-[28px] font-extrabold leading-tight mt-1 text-foreground">
                Save SOS Contacts
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                These contacts receive your automated WhatsApp SOS and live GPS coordinates.
              </p>
            </div>

            {/* List of current emergency contacts */}
            <div className="space-y-2.5">
              {contactsList.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
                  <UserAvatar avatarId={c.avatar} size={42} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold truncate">{c.name}</span>
                      {c.primary && <span className="text-[10px] bg-brand-soft text-brand px-1.5 py-0.5 rounded-full font-bold">Primary</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{c.relation} · {c.phone}</span>
                  </div>
                  {contactsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(c.id)}
                      className="text-destructive p-1.5 hover:bg-muted rounded-lg"
                      aria-label="Remove contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Contact Card */}
            <form onSubmit={handleAddEmergencyContact} className="screen-card p-4 border border-border space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus size={15} /> Add Another Trusted Contact
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="field h-10 text-xs"
                  placeholder="Name (e.g. Sister)"
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                />
                <input
                  className="field h-10 text-xs"
                  placeholder="WhatsApp Number"
                  value={newContactPhone}
                  onChange={e => setNewContactPhone(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="w-full text-xs font-bold border-brand text-brand">
                + Add To List
              </Button>
            </form>
          </div>
        )}

        {/* STEP 5: LOCATION PERMISSION */}
        {step === 5 && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 5 · GPS Permission</span>
              <h1 className="text-[28px] font-extrabold leading-tight mt-1 text-foreground">
                Live GPS Location
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Required to automatically send your live location coordinates in emergency SOS alerts.
              </p>
            </div>

            <div className="screen-card p-6 border border-border text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-soft text-brand grid place-items-center text-3xl shadow-sm mb-4">
                📍
              </div>
              <h2 className="text-lg font-bold text-foreground">Allow Live GPS Location?</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
                InSafe will continuously share your real-time coordinates every 1 minute with emergency contacts when SOS is active.
              </p>

              <div className="mt-6 space-y-2.5">
                <Primary onClick={handleAllowLocation} disabled={locationLoading}>
                  {locationLoading ? 'Detecting Location...' : locationGranted ? '✓ Location Active' : 'Allow Live Location'}
                </Primary>
                <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => setStep(6)}>
                  Continue with standard coordinates
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: READY / CONFIRMATION */}
        {step === 6 && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Setup Complete</span>
              <h1 className="text-[30px] font-extrabold leading-tight mt-1 text-foreground">
                You are Protected
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Everything is configured for automated protection.
              </p>
            </div>

            <div className="screen-card p-5 border border-border space-y-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar gender={gender} size={54} />
                <div>
                  <h3 className="font-extrabold text-base">{name.trim() || 'Priya Sharma'}</h3>
                  <p className="text-xs text-muted-foreground">{phone.trim() || '+91 98765 43210'}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Emergency Contacts:</span>
                  <span className="font-bold text-foreground">{contactsList.length} Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Automated WhatsApp SOS:</span>
                  <span className="font-bold text-brand">Ready (60s loop)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SOS Trigger:</span>
                  <span className="font-bold text-foreground">3-Second Press & Hold</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BUTTON BAR */}
      <div className="mt-8">
        {step === 1 && (
          <Primary onClick={() => setStep(2)}>
            Continue to Details <ArrowRight size={18} />
          </Primary>
        )}
        {step === 2 && (
          <Primary onClick={() => setStep(3)}>
            Next: Contact Access <ArrowRight size={18} />
          </Primary>
        )}
        {step === 4 && (
          <Primary onClick={() => setStep(5)}>
            Next: Live GPS Location <ArrowRight size={18} />
          </Primary>
        )}
        {step === 6 && (
          <Primary onClick={handleFinishSetup}>
            Enter InSafe Dashboard <ArrowRight size={18} />
          </Primary>
        )}
      </div>
      <Notice />
    </main>
  );
}

// SOS BUTTON WITH 3-SECOND PRESS & HOLD
function HoldToSOSButton({ onTrigger }: { onTrigger: () => void }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setHolding(true);
    setProgress(0);
    setShowTip(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / 3000) * 100, 100);
      setProgress(pct);

      if (elapsed >= 3000) {
        if (timerRef.current) clearInterval(timerRef.current);
        setHolding(false);
        setProgress(100);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 300]);
        }
        onTrigger();
      }
    }, 50);
  };

  const endHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (holding && progress < 100) {
      setShowTip(true);
    }
    setHolding(false);
    setProgress(0);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        className={`relative w-full h-14 rounded-full overflow-hidden transition-transform active:scale-[0.98] select-none flex items-center justify-center font-extrabold text-base tracking-wide shadow-lg ${
          holding ? 'bg-destructive text-white shadow-destructive/40' : 'bg-primary text-primary-foreground hover:bg-primary/95'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Progress Fill Indicator */}
        <div
          className="absolute inset-0 bg-destructive transition-all ease-linear"
          style={{
            width: `${progress}%`,
            opacity: holding ? 1 : 0,
            transitionDuration: '50ms'
          }}
        />

        {/* Button Content */}
        <span className="relative z-10 flex items-center gap-2">
          <Megaphone size={21} className={holding ? 'animate-bounce' : ''} />
          {holding
            ? `HOLD FOR 3s... (${((3000 - (progress * 30)) / 1000).toFixed(1)}s)`
            : 'HOLD FOR 3s · SOS'}
        </span>
      </button>

      {showTip && (
        <p className="mt-2 text-center text-xs font-semibold text-destructive animate-fade-in flex items-center justify-center gap-1">
          <AlertTriangle size={13} /> Hold for full 3 seconds to send SOS alert.
        </p>
      )}
    </div>
  );
}

// 3. DASHBOARD SCREEN (With Selected Avatar in Header & 3-Second Hold SOS)
export function Dashboard() {
  const { state, update } = useApp();
  const navigate = useNavigate();

  const handleSOSTrigger = () => {
    update({ emergency: { active: true, trigger: 'sos' } });
    navigate({ to: '/emergency' });
  };

  const displayName = state.user.name ? state.user.name.split(' ')[0] : 'Priya';

  return (
    <main className="screen screen-soft page-enter pb-8">
      <h1 className="sr-only">InSafe dashboard</h1>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/profile" title="Tap to change avatar" className="relative block">
            <UserAvatar avatarId={state.user.avatar} size={48} />
            <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-brand p-0.5 text-primary-foreground">
              <ShieldCheck size={12}/>
            </span>
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold text-foreground">Hello {displayName},</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <MapPin size={12} className="shrink-0 text-brand"/> {state.currentLocation ? `${state.currentLocation.lat.toFixed(4)}° N, ${state.currentLocation.lng.toFixed(4)}° E · Live GPS` : 'Detecting live location...'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="square" asChild aria-label="Settings">
          <Link to="/settings"><Settings size={19}/></Link>
        </Button>
      </header>

      {/* Quick Status Bar */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-card border border-border px-3.5 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-foreground font-semibold">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse"/>
          Auto-WhatsApp: Active (1 min)
        </span>
        <Link to="/contacts" className="text-brand font-bold hover:underline">
          {state.contacts.length} Contacts →
        </Link>
      </div>

      <div className="screen-card mt-4 overflow-hidden">
        <MapVisual />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { to: '/safenet', icon: <ShieldCheck size={27}/>, title: 'InSafe Network', color: 'text-brand', bg: 'bg-brand-soft' },
          { to: '/fake-call', icon: <PhoneCall size={27}/>, title: 'Fake Call', color: 'text-blue', bg: 'bg-blue-soft' },
          { to: '/mute-call', icon: <VolumeX size={27}/>, title: 'Mute Call', color: 'text-gold', bg: 'bg-secondary' }
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="screen-card flex min-h-28 flex-col items-center justify-center gap-3 px-1 text-center transition-transform hover:-translate-y-1"
          >
            <span className={`grid h-11 w-11 place-items-center rounded-[14px] ${item.bg} ${item.color}`}>
              {item.icon}
            </span>
            <span className="text-xs font-bold leading-4">{item.title}</span>
          </Link>
        ))}
      </div>

      {/* 3-SECOND HOLD SOS BUTTON */}
      <div className="mt-5">
        <HoldToSOSButton onTrigger={handleSOSTrigger} />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Press and hold for 3 seconds to trigger automated dispatch.</p>
      <Notice />
    </main>
  );
}

// 4. EMERGENCY SCREEN (With Avatars in Orbit & 1-min Auto-Updates)
export function EmergencyScreen() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(60);
  const [updateCount, setUpdateCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds(n => {
        if (n <= 1) {
          setUpdateCount(c => c + 1);
          return 60;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const close = () => {
    update({ emergency: { active: false, trigger: 'sos' } });
    navigate({ to: '/dashboard' });
  };

  return (
    <main className="screen emergency-screen flex flex-col page-enter justify-between pb-8">
      <div>
        <div className="screen-top">
          <Button variant="ghost" size="square" onClick={close} className="rounded-full bg-emergency-glass text-emergency-foreground hover:bg-emergency-glass" aria-label="End emergency">
            <ArrowLeft/>
          </Button>
          <span className="rounded-full bg-emergency-glass px-4 py-1.5 text-xs font-semibold tracking-wider">
            SOS · ACTIVE
          </span>
          <span className="w-11"/>
        </div>

        <div className="mt-6 text-center">
          <span className="rounded-full bg-emergency-glass px-4 py-1.5 text-xs font-semibold">
            {state.emergency.trigger === 'discreet' ? 'DISCREET HELP' : 'EMERGENCY DISPATCH ACTIVE'}
          </span>
          <h1 className="mt-4 text-[32px] font-extrabold tracking-tight">Emergency Calling...</h1>
          <p className="mx-auto mt-2 max-w-[300px] text-xs leading-5 text-emergency-foreground/80">
            Automated WhatsApp alerts dispatched with live GPS coordinates to your saved emergency contacts.
          </p>
        </div>

        {/* Radar Orbit with User & Contact Avatars */}
        <div className="radar">
          <div className="relative z-10 flex flex-col items-center">
            <ShieldCheck size={42}/>
            <strong className="mt-1 text-2xl font-black">InSafe</strong>
            <span className="text-[10px] opacity-80">Safety is Freedom</span>
          </div>
          {state.contacts.slice(0, 6).map((contact, index) => {
            const angle = (index * 360 / Math.min(state.contacts.length, 6) - 90) * Math.PI / 180;
            return (
              <div
                key={contact.id}
                title={contact.name}
                className="absolute z-10 grid h-12 w-12 place-items-center rounded-full border-[3px] border-emergency-foreground/80 shadow-lg overflow-hidden"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * 40}% - 24px)`,
                  top: `calc(50% + ${Math.sin(angle) * 40}% - 24px)`
                }}
              >
                <UserAvatar avatarId={contact.avatar || (index % 2 === 0 ? 'f2' : 'm1')} size={48} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Automated Live WhatsApp Update Monitor Card */}
      <div className="rounded-[20px] bg-emergency-glass p-4 border border-white/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"/>
            WhatsApp Auto-Update #{updateCount}
          </span>
          <span className="text-sm font-bold tabular-nums">
            Next: {String(seconds).padStart(2, '0')}s
          </span>
        </div>
        <p className="mt-1 text-xs text-emergency-foreground/80">
          Sending live location every 1 minute automatically. No manual interaction required.
        </p>
      </div>

      <Primary className="mt-6 w-full" onClick={close}>
        I&apos;m Safe Now <Check size={18}/>
      </Primary>
    </main>
  );
}

// 5. SETTINGS SCREEN
export function SettingsScreen() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const rows = [
    { icon: UserRound, title: 'Change Avatar & Profile', sub: 'Select Male, Female or Neutral avatar', to: '/profile' },
    { icon: Users, title: 'Emergency Contacts', sub: 'Manage SOS WhatsApp contacts', to: '/contacts' },
    { icon: MapPin, title: 'Show My Location', sub: 'Allow location access', to: null },
    { icon: Mail, title: 'Setup Auto Message', sub: 'Manage alert message', to: '/auto-message' },
    { icon: LogOut, title: 'Reset to Welcome', sub: 'Click here to restart setup', to: '/' }
  ];

  return (
    <Page title="Settings" soft>
      <div className="space-y-1">
        {rows.map(row => (
          <div key={row.title} className="flex items-center gap-3 border-b border-border/60 py-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-brand-soft text-brand">
              <row.icon size={21} fill={row.title === 'Setup Auto Message' ? 'currentColor' : 'none'}/>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[15px]">{row.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{row.sub}</p>
            </div>
            {row.to ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={row.title}
                onClick={() => {
                  if (row.title === 'Reset to Welcome') {
                    if (typeof window !== 'undefined' && !window.confirm('Reset app setup? Your safety settings will be re-initialized.')) return;
                    update({ emergency: { active: false, trigger: 'sos' } });
                  }
                  navigate({ to: row.to! });
                }}
              >
                <ChevronRight size={19}/>
              </Button>
            ) : (
              <Switch
                label="Show my location"
                checked={state.shareLocation}
                onChange={() => update({ shareLocation: !state.shareLocation })}
              />
            )}
          </div>
        ))}
      </div>
    </Page>
  );
}

// 6. SETUP AUTO MESSAGE
export function AutoMessage() {
  const { state, update, notify } = useApp();
  const channels = [
    { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
    { key: 'sms' as const, label: 'SMS', icon: Phone },
    { key: 'email' as const, label: 'Email', icon: Mail }
  ];

  return (
    <Page title="Setup Auto Message" back="/settings">
      <div className="space-y-1">
        {channels.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3 border-b border-border py-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon size={20}/>
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Auto send to all contacts every 1 min</p>
            </div>
            <Switch
              label={`Toggle ${label}`}
              checked={state.channels[key]}
              onChange={() => update({ channels: { ...state.channels, [key]: !state.channels[key] } })}
            />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <label className="field-label" htmlFor="message">Emergency message template</label>
        <textarea
          id="message"
          className="textarea min-h-36"
          value={state.message}
          onChange={e => update({ message: e.target.value })}
        />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Available tokens: {'{{location}}'}, {'{{maps_link}}'}, {'{{timestamp}}'}
        </p>
      </div>
      <Primary className="mt-8 w-full" onClick={() => notify('Message preferences saved.')}>
        <Check size={18}/> Save & Update
      </Primary>
      <Notice />
    </Page>
  );
}

// 7. CONTACTS SCREEN (With Avatar Selection for Contacts)
export function ContactsScreen() {
  const { state, update, notify } = useApp();
  const [editing, setEditing] = useState<Contact | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [avatar, setAvatar] = useState('f2');

  const launch = (contact?: Contact) => {
    setEditing(contact ?? null);
    setName(contact?.name ?? '');
    setPhone(contact?.phone ?? '');
    setRelation(contact?.relation ?? '');
    setAvatar(contact?.avatar ?? 'f2');
    setOpen(true);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const contact: Contact = {
      id: editing?.id ?? String(Date.now()),
      name,
      phone,
      relation,
      avatar,
      primary: editing?.primary ?? state.contacts.length === 0,
      alerts: editing?.alerts ?? true,
      location: editing?.location ?? true
    };
    update({
      contacts: editing
        ? state.contacts.map(c => c.id === editing.id ? contact : c)
        : [...state.contacts, contact]
    });
    setOpen(false);
    notify(editing ? 'Contact updated.' : 'Contact added.');
  };

  const modify = (id: string, patch: Partial<Contact>) =>
    update({ contacts: state.contacts.map(c => c.id === id ? { ...c, ...patch } : c) });

  return (
    <Page
      title="Emergency Contacts"
      back="/settings"
      soft
      action={
        <Button variant="ghost" size="icon" onClick={() => launch()} aria-label="Add contact">
          <Plus size={23}/>
        </Button>
      }
    >
      <p className="-mt-4 mb-6 text-sm text-muted-foreground">People you trust, notified automatically on WhatsApp.</p>
      <div className="space-y-3">
        {state.contacts.map(contact => (
          <div key={contact.id} className="screen-card p-4">
            <div className="flex items-center gap-3">
              <UserAvatar avatarId={contact.avatar || 'f2'} size={46} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">{contact.name}</span>
                  {contact.primary && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">Primary</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{contact.relation} · {contact.phone}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => launch(contact)} aria-label={`Edit ${contact.name}`}>
                <Settings size={17}/>
              </Button>
            </div>
            <div className="mt-4 space-y-2.5 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs font-medium">
                Auto-WhatsApp SOS alerts
                <Switch label={`SOS alerts for ${contact.name}`} checked={contact.alerts} onChange={() => modify(contact.id, { alerts: !contact.alerts })}/>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                Live location updates (1 min)
                <Switch label={`Location updates for ${contact.name}`} checked={contact.location} onChange={() => modify(contact.id, { location: !contact.location })}/>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="link" size="sm" className="px-0 text-brand text-xs" onClick={() => update({ contacts: state.contacts.map(c => ({ ...c, primary: c.id === contact.id })) })}>
                  Mark as primary
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto px-0 text-destructive text-xs"
                  onClick={() => {
                    if (state.contacts.length <= 1) {
                      notify('⚠️ Safety Alert: You must keep at least 1 emergency contact.');
                      return;
                    }
                    if (typeof window !== 'undefined' && !window.confirm(`Remove ${contact.name} from emergency contacts?`)) return;
                    update({ contacts: state.contacts.filter(c => c.id !== contact.id) });
                    notify('Contact removed safely.');
                  }}
                >
                  <Trash2 size={13} className="mr-1"/> Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Primary className="mt-6 w-full" onClick={() => launch()}>
        <Plus size={18}/> Add Emergency Contact
      </Primary>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-[430px] rounded-t-[24px] bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? 'Edit contact' : 'Add contact'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close"><X/></Button>
            </div>

            {/* Contact Photo Selector */}
            <div className="mt-4">
              <span className="field-label">Contact Photo</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Female', photo: '/images/profile-female.jpg' },
                  { label: 'Male', photo: '/images/profile-male.jpg' },
                  { label: 'Other', photo: '/images/profile-other.jpg' },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAvatar(p.photo)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-xs font-bold ${
                      avatar === p.photo ? 'border-brand bg-brand-soft text-brand shadow-sm scale-105' : 'border-border bg-card'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                      <img src={p.photo} alt={p.label} className="w-full h-full object-cover" />
                    </div>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={save} className="mt-4 space-y-4">
              <Field label="Name" value={name} onChange={setName} placeholder="e.g. Maa, Papa" required/>
              <Field label="WhatsApp Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+91 98765 43210" required/>
              <Field label="Relationship" value={relation} onChange={setRelation} placeholder="e.g. Mother, Father, Friend" required/>
              <Primary type="submit" className="mt-4">Save Contact</Primary>
            </form>
          </div>
        </div>
      )}
      <Notice/>
    </Page>
  );
}

// 8. SAFENET
export function SafeNet() {
  const { state, update, notify } = useApp();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Poor lighting');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');

  const report = (e: FormEvent) => {
    e.preventDefault();
    const cleanDesc = description.slice(0, 300).replace(/<[^>]*>/g, '').trim();
    if (!cleanDesc) return;
    update({ reports: [{ id: String(Date.now()), category, severity, description: cleanDesc }, ...state.reports] });
    setDescription('');
    setOpen(false);
    notify('Incident reported securely to InSafe Network.');
  };

  return (
    <Page title="InSafe Network" soft>
      <p className="-mt-4 mb-4 text-sm text-muted-foreground">Community safety reports near your area</p>
      <MapVisual incidents/>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>🟡 Poor lighting</span>
        <span>🔴 Unsafe area</span>
        <span>🔵 Other report</span>
      </div>
      <Primary className="mt-6 w-full" onClick={() => setOpen(true)}>
        <Plus size={18}/> Report Incident
      </Primary>
      <h2 className="mt-8 mb-3 text-lg font-bold">Recent community reports</h2>
      <div className="space-y-3">
        {state.reports.map(r => (
          <div key={r.id} className="screen-card p-4">
            <div className="flex items-center justify-between">
              <strong className="text-sm font-bold">{r.category}</strong>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{r.severity}</span>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-[430px] rounded-t-[24px] bg-card p-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Report incident</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close"><X/></Button>
            </div>
            <form onSubmit={report} className="mt-4 space-y-4">
              <label className="block">
                <span className="field-label">Category</span>
                <select className="field" value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Poor lighting</option>
                  <option>Unsafe area</option>
                  <option>Harassment</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block">
                <span className="field-label">Severity</span>
                <select className="field" value={severity} onChange={e => setSeverity(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <label className="block">
                <span className="field-label">Description</span>
                <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} required placeholder="What happened?"/>
              </label>
              <Primary type="submit">Submit Report</Primary>
            </form>
          </div>
        </div>
      )}
      <Notice/>
    </Page>
  );
}

// 9. FAKE CALL
export function FakeCall() {
  const [name, setName] = useState('Mom');
  const [ringtone, setRingtone] = useState('Classic ring');
  const [delay, setDelay] = useState(5);
  const [script, setScript] = useState('Hey, where are you? I’m waiting outside.');
  const [active, setActive] = useState(false);
  const [answered, setAnswered] = useState(false);

  return (
    <Page title="Fake Call" soft>
      <p className="-mt-4 mb-6 text-sm text-muted-foreground">Trigger a realistic incoming call to discreetly step away.</p>
      <div className="space-y-5">
        <Field label="Caller name" value={name} onChange={setName}/>
        <div>
          <span className="field-label">Quick presets</span>
          <div className="flex gap-3">
            {['M', 'P', 'R'].map(letter => (
              <Button
                key={letter}
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full border-brand text-brand"
                onClick={() => setName(letter === 'M' ? 'Mom' : letter === 'P' ? 'Priya' : 'Rohan')}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="field-label">Ringtone</span>
          <select className="field" value={ringtone} onChange={e => setRingtone(e.target.value)}>
            <option>Classic ring</option>
            <option>Gentle chime</option>
            <option>Soft pulse</option>
          </select>
        </label>
        <label className="block">
          <span className="field-label">Call delay · {delay} seconds</span>
          <input className="w-full accent-brand" type="range" min="0" max="30" step="5" value={delay} onChange={e => setDelay(Number(e.target.value))}/>
        </label>
        <label className="block">
          <span className="field-label">Conversation script</span>
          <textarea className="textarea" value={script} onChange={e => setScript(e.target.value)}/>
        </label>
      </div>

      <Primary className="mt-8 w-full" onClick={() => { setAnswered(false); setActive(true); }}>
        <PhoneCall size={18}/> Preview Call
      </Primary>

      {active && (
        <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[430px] flex-col items-center bg-foreground px-6 py-12 text-primary-foreground animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => setActive(false)} className="self-end text-primary-foreground" aria-label="Close call preview">
            <X/>
          </Button>
          <span className="mt-20 grid h-28 w-28 place-items-center rounded-full bg-brand text-5xl font-semibold shadow-2xl">
            {name[0] || 'M'}
          </span>
          <h2 className="mt-7 text-3xl font-bold">{name}</h2>
          <p className="mt-2 text-sm opacity-80">{answered ? script : `Incoming call · ${ringtone}`}</p>
          <p className="mt-2 text-xs opacity-50">Simulation</p>
          <div className="mt-auto flex w-full justify-around pb-6">
            <Button variant="ghost" className="flex h-auto flex-col gap-2 text-primary-foreground" onClick={() => setActive(false)}>
              <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive shadow-lg"><PhoneOff size={27}/></span>
              Decline
            </Button>
            <Button variant="ghost" className="flex h-auto flex-col gap-2 text-primary-foreground" onClick={() => setAnswered(true)}>
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand shadow-lg"><Phone size={27}/></span>
              {answered ? 'Connected' : 'Accept'}
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
}

// 10. MUTE CALL
export function MuteCall() {
  const { update } = useApp();
  const navigate = useNavigate();

  return (
    <Page title="Mute Call" soft>
      <div className="mt-8 flex flex-col items-center text-center">
        <span className="grid h-28 w-28 place-items-center rounded-full bg-brand-soft text-brand">
          <VolumeX size={46} strokeWidth={1.5}/>
        </span>
        <h2 className="mt-6 text-2xl font-bold">Help, without the noise.</h2>
        <p className="mt-2.5 max-w-[290px] text-sm leading-6 text-muted-foreground">
          A completely silent way to trigger automated WhatsApp emergency alerts when you cannot speak.
        </p>
      </div>
      <div className="screen-card mt-10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="shrink-0 text-brand mt-0.5" size={20}/>
          <p className="text-xs leading-5 text-muted-foreground">
            Discreet SOS dispatches live GPS location silently to your emergency contacts without sound or alarms.
          </p>
        </div>
      </div>
      <Primary
        className="mt-8 w-full"
        onClick={() => {
          update({ emergency: { active: true, trigger: 'discreet' } });
          navigate({ to: '/emergency' });
        }}
      >
        Activate Discreet Help <ArrowRight size={18}/>
      </Primary>
    </Page>
  );
}

// 11. PROFILE SCREEN (Setting me jakar Gender aur Photo auto-change karne ka option)
export function Profile() {
  const { state, update, notify } = useApp();
  const [name, setName] = useState(state.user.name);
  const [phone, setPhone] = useState(state.user.phone);
  const [gender, setGender] = useState<'female' | 'male' | 'other'>(
    (state.user.gender as any) === 'male' ? 'male' : (state.user.gender as any) === 'other' ? 'other' : 'female'
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update({
      user: {
        ...state.user,
        name,
        phone,
        gender,
        avatar: getProfilePhotoByGender(gender),
      }
    });
    notify('Profile updated! Photo set automatically.');
  };

  return (
    <Page title="Profile & Photo" back="/settings">
      {/* Current Photo Display */}
      <div className="mb-6 grid place-items-center text-center">
        <div className="relative">
          <UserAvatar gender={gender} size={112} className="ring-4 ring-brand/20 shadow-xl" />
          <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-card bg-brand p-1 text-primary-foreground shadow">
            <ShieldCheck size={16}/>
          </span>
        </div>
        <h3 className="mt-3.5 font-extrabold text-base capitalize text-foreground">
          {gender === 'female' ? 'Female Photo' : gender === 'male' ? 'Male Photo' : 'Other Photo'}
        </h3>
        <span className="mt-0.5 text-xs text-brand font-semibold flex items-center gap-1">
          <Sparkles size={13}/> Photo updates automatically with gender
        </span>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Gender Selection */}
        <div>
          <span className="field-label">Select Gender (Changes Photo)</span>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'female', label: 'Female', photo: '/images/profile-female.jpg' },
              { id: 'male', label: 'Male', photo: '/images/profile-male.jpg' },
              { id: 'other', label: 'Other', photo: '/images/profile-other.jpg' },
            ].map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGender(g.id as any)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-xs font-bold ${
                  gender === g.id
                    ? 'border-brand bg-brand-soft text-brand shadow-md scale-105'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm mb-2">
                  <img src={g.photo} alt={g.label} className="w-full h-full object-cover" />
                </div>
                <span>{g.label}</span>
                {gender === g.id && (
                  <span className="mt-1 text-[10px] bg-brand text-white px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Field label="Your Name" value={name} onChange={setName} required/>
        <Field label="Phone number (WhatsApp)" value={phone} onChange={setPhone} type="tel" required/>

        <Primary type="submit" className="mt-6 w-full">
          <Check size={18}/> Save Changes
        </Primary>
      </form>
      <Notice/>
    </Page>
  );
}
