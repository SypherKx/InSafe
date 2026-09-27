'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { FakeCallProfile } from '@/types';

export default function FakeCallOverlay() {
  const [profile, setProfile] = useState<FakeCallProfile | null>(null);
  const [phase, setPhase] = useState<'ringing' | 'connected' | null>(null);
  const [callTimer, setCallTimer] = useState(0);

  const handleEnd = useCallback(() => {
    setPhase(null);
    setProfile(null);
    setCallTimer(0);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as FakeCallProfile;
      setProfile(detail);
      setPhase('ringing');

      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    };
    window.addEventListener('insafe-fake-call', handler);
    return () => window.removeEventListener('insafe-fake-call', handler);
  }, []);

  // Call timer when connected
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === 'connected') {
      interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  if (!profile || !phase) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: phase === 'ringing'
        ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(180deg, #0f3460 0%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, color: 'white',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Caller Info */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        {/* Avatar */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 42, fontWeight: 700,
          border: '3px solid rgba(255,255,255,0.2)',
          animation: phase === 'ringing' ? 'pulse 1.5s infinite' : 'none',
        }}>
          {profile.callerName[0].toUpperCase()}
        </div>

        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {profile.callerName}
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>
          {phase === 'ringing' ? 'Incoming Call...' : formatTime(callTimer)}
        </div>
      </div>

      {/* Call Actions */}
      {phase === 'ringing' && (
        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          {/* Decline */}
          <button
            onClick={handleEnd}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#EF4444', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>

          {/* Accept */}
          <button
            onClick={() => setPhase('connected')}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#22C55E', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Connected state */}
      {phase === 'connected' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Script bubble */}
          {profile.script && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '16px 24px', borderRadius: 'var(--radius-lg)',
              maxWidth: 300, textAlign: 'center',
              fontSize: 14, color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6, marginBottom: 24,
            }}>
              &ldquo;{profile.script}&rdquo;
            </div>
          )}

          {/* End Call */}
          <button
            onClick={handleEnd}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#EF4444', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>End Call</span>
        </div>
      )}
    </div>
  );
}
