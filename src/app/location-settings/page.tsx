'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, LocationPin } from '@/components/Icons';

export default function LocationSettingsPage() {
  const router = useRouter();
  const { locationPermission, requestLocation, setLocationPermission, currentLocation } = useApp();

  const handleToggle = async () => {
    if (locationPermission) {
      setLocationPermission(false);
    } else {
      await requestLocation();
    }
  };

  return (
    <div style={{
      minHeight: '100vh', minHeight: '100dvh',
      background: 'var(--color-bg)',
    }}>
      <div className="page-header">
        <button className="back-button" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        <h1 className="page-title" style={{ marginBottom: 28 }}>Show My Location</h1>

        {/* Location Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', borderBottom: '1px solid var(--color-border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="settings-icon-chip">
              <LocationPin size={22} color="#22C55E" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Location Access</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {locationPermission ? 'Location sharing is enabled' : 'Enable to share your location'}
              </div>
            </div>
          </div>
          <div
            className={`toggle-switch ${locationPermission ? 'active' : ''}`}
            onClick={handleToggle}
            role="switch"
            aria-checked={locationPermission}
          />
        </div>

        {/* Current Location Display */}
        {currentLocation && locationPermission && (
          <div style={{
            marginTop: 24, padding: 20,
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>CURRENT LOCATION</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.8 }}>
              <div>Latitude: {currentLocation.lat.toFixed(6)}</div>
              <div>Longitude: {currentLocation.lng.toFixed(6)}</div>
              <div>Accuracy: ±{currentLocation.accuracy.toFixed(0)}m</div>
            </div>
            <a
              href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', marginTop: 12,
                color: 'var(--color-accent-green)', fontWeight: 600,
                fontSize: 14, textDecoration: 'none',
              }}
            >
              Open in Google Maps →
            </a>
          </div>
        )}

        <div style={{
          marginTop: 24, padding: 16,
          background: 'var(--color-accent-green-softer)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6,
        }}>
          <strong>Privacy note:</strong> Your location is only shared during an active SOS emergency or Safety Journey.
          InSafe does not continuously track your location in the background.
        </div>
      </div>
    </div>
  );
}
