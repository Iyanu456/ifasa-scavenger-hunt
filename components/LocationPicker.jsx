'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '@/utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LocationPicker({ code, onSave, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const initialLat = code.lat ?? 7.5190;
  const initialLng = code.lng ?? 4.5215;

  const [pickedLat, setPickedLat] = useState(code.lat ?? null);
  const [pickedLng, setPickedLng] = useState(code.lng ?? null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    function attachDragEnd(marker) {
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setPickedLat(parseFloat(lat.toFixed(6)));
        setPickedLng(parseFloat(lng.toFixed(6)));
      });
    }

    if (code.lat != null && code.lng != null) {
      markerRef.current = L.marker([code.lat, code.lng], { draggable: true }).addTo(map);
      attachDragEnd(markerRef.current);
    }

    map.on('click', (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        attachDragEnd(markerRef.current);
      }

      setPickedLat(lat);
      setPickedLng(lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  function handleUseMyLocation() {
    setLocating(true);
    setLocateError(null);

    if (!navigator.geolocation) {
      setLocateError('Location services are not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        mapInstanceRef.current.flyTo([lat, lng], 18, { duration: 1.2 });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
          markerRef.current.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            setPickedLat(parseFloat(lat.toFixed(6)));
            setPickedLng(parseFloat(lng.toFixed(6)));
          });
        }

        setPickedLat(lat);
        setPickedLng(lng);
        setLocating(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError('Location access was denied. Check your browser permissions.');
        } else {
          setLocateError('Could not get your location. Try again or place the pin manually.');
        }
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }

  async function handleSave() {
    if (pickedLat === null || pickedLng === null) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.admin.updateCoords(code.slug, pickedLat, pickedLng);
      onSave({ lat: pickedLat, lng: pickedLng });
      onClose();
    } catch {
      setSaveError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="location-picker-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="location-picker-modal">
        {/* Header */}
        <div className="location-picker-header">
          <div>
            <h3 className="mb-1">Set Location — {code.location}</h3>
            <span className="mono-label">{code.slug}</span>
          </div>
          <button className="location-picker-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <hr className="divider my-1" />

        <p className="mono-label opacity-60 text-[11px]">
          Tap anywhere on the map to place the pin, or drag the pin to adjust.
        </p>

        {/* Map — height comes from .map-container in globals.css (Leaflet requirement) */}
        <div ref={mapContainerRef} className="map-container md:min-h-[260px]" />

        <hr className="divider my-2" />

        {/* Coordinate display */}
        <div className="coord-display">
          <div className="coord-item">
            <span className="mono-label">Latitude</span>
            <span className="coord-value">
              {pickedLat !== null ? pickedLat.toFixed(6) : '—'}
            </span>
          </div>
          <div className="coord-item">
            <span className="mono-label">Longitude</span>
            <span className="coord-value">
              {pickedLng !== null ? pickedLng.toFixed(6) : '—'}
            </span>
          </div>
        </div>

        <hr className="divider my-1" />

        <div>
          <button
            className="btn btn-secondary use-location-btn"
            onClick={handleUseMyLocation}
            disabled={locating}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            {locating ? 'Getting location...' : 'Use My Current Location'}
          </button>
          {locateError && (
            <p className="form-error mt-2">{locateError}</p>
          )}
        </div>

        <hr className="divider my-1" />

        {saveError && <p className="form-error mb-2">{saveError}</p>}
        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={pickedLat === null || pickedLng === null || saving}
          >
            {saving ? 'Saving...' : 'Save Location'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
