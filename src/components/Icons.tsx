import React from 'react';

// InSafe Logo Pin - the brand mark
export const InSafeLogo = ({ size = 48, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M24 4C16.268 4 10 10.268 10 18C10 28 24 44 24 44C24 44 38 28 38 18C38 10.268 31.732 4 24 4Z" fill="#F59E0B"/>
    <path d="M24 6C17.373 6 12 11.373 12 18C12 26.5 24 40 24 40C24 40 36 26.5 36 18C36 11.373 30.627 6 24 6Z" fill="#22C55E"/>
    <circle cx="24" cy="17" r="8" fill="white"/>
    <path d="M24 14C22.343 14 21 15.343 21 17C21 18.657 22.343 20 24 20C25.657 20 27 18.657 27 17C27 15.343 25.657 14 24 14Z" fill="#22C55E"/>
    <path d="M18 22C18 22 19 20 21 20H27C29 20 30 22 30 22" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 21C20 21 20.5 19.5 22 19.5" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <path d="M28 21C28 21 27.5 19.5 26 19.5" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// InSafe Logo with text lockup
export const InSafeLogoLockup = ({ size = 'md', color = 'dark' }: { size?: 'sm' | 'md' | 'lg'; color?: 'dark' | 'light' }) => {
  const sizes = { sm: { icon: 32, title: 16, tag: 10 }, md: { icon: 44, title: 22, tag: 12 }, lg: { icon: 56, title: 28, tag: 14 } };
  const s = sizes[size];
  const textColor = color === 'light' ? 'white' : 'var(--color-text-primary)';
  const tagColor = color === 'light' ? 'rgba(255,255,255,0.7)' : 'var(--color-accent-green)';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <InSafeLogo size={s.icon} />
      <span style={{ fontSize: s.title, fontWeight: 700, color: color === 'light' ? '#22C55E' : '#22C55E', letterSpacing: -0.5 }}>InSafe</span>
      <span style={{ fontSize: s.tag, color: tagColor, fontWeight: 500 }}>Safety is Freedom</span>
    </div>
  );
};

// Megaphone icon for SOS
export const MegaphoneIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l18-5v12L3 13v-2z"/>
    <path d="M11.6 16.8a3 3 0 11-5.8-1.6"/>
  </svg>
);

// Chevron Right
export const ChevronRight = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

// Arrow Left (back)
export const ArrowLeft = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/>
    <path d="M12 19l-7-7 7-7"/>
  </svg>
);

// Settings Gear
export const GearIcon = ({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

// Location Pin
export const LocationPin = ({ size = 16, color = '#22C55E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

// Person/Profile icon
export const PersonIcon = ({ size = 22, color = '#22C55E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

// People/Group icon
export const PeopleIcon = ({ size = 22, color = '#22C55E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

// Fake Call icon (phone with X)
export const FakeCallIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M18 14l-4.5 4.5c2.6 5.1 6.9 9.3 12 12L30 26l4 1v6c0 1.1-.9 2-2 2C18.6 35 9 25.4 9 12c0-1.1.9-2 2-2h6l1 4z" fill="#3B82F6"/>
    <line x1="28" y1="10" x2="34" y2="16" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="34" y1="10" x2="28" y2="16" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// Mute Call icon (crossed mic/tools)
export const MuteCallIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M15 18L22 11L29 18" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 26L22 31L27 26" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="14" y1="22" x2="30" y2="22" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="12" y1="30" x2="32" y2="12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// InSafe Network icon (pin with people)
export const NetworkIcon = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <path d="M22 6C16.477 6 12 10.477 12 16C12 24 22 38 22 38C22 38 32 24 32 16C32 10.477 27.523 6 22 6Z" fill="#F59E0B"/>
    <path d="M22 8C17.582 8 14 11.582 14 16C14 22.5 22 34 22 34C22 34 30 22.5 30 16C30 11.582 26.418 8 22 8Z" fill="#22C55E"/>
    <circle cx="22" cy="15" r="5" fill="white"/>
    <path d="M22 13.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" fill="#22C55E"/>
    <path d="M18.5 19.5s.75-1.5 2-1.5h3c1.25 0 2 1.5 2 1.5" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// Envelope/Email icon
export const EnvelopeIcon = ({ size = 22, color = '#22C55E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M22 7l-10 7L2 7"/>
  </svg>
);

// Logout/Exit icon
export const LogoutIcon = ({ size = 22, color = '#22C55E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// Google G icon
export const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Phone icon
export const PhoneIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

// Plus icon
export const PlusIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// Trash/Delete icon
export const TrashIcon = ({ size = 18, color = '#EF4444' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

// Shield/Check icon
export const ShieldCheckIcon = ({ size = 22, color = '#22C55E' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

// Map Pin for marker
export const MapPinIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 32 42" fill="none">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#F59E0B"/>
    <path d="M16 2C8.27 2 2 8.27 2 16c0 10.5 14 22 14 22s14-11.5 14-22C30 8.27 23.73 2 16 2z" fill="#22C55E"/>
    <circle cx="16" cy="15" r="7" fill="white"/>
    <circle cx="16" cy="14" r="3" fill="#22C55E"/>
    <path d="M11 20c0 0 1.5-2 3-2h4c1.5 0 3 2 3 2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Close/X icon
export const CloseIcon = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Edit/Pencil icon
export const EditIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// Alert/Warning icon
export const AlertIcon = ({ size = 20, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);
