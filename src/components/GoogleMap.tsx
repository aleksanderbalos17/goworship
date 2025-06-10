import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (lat: string, lng: string) => void;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export function GoogleMap({ latitude, longitude, onLocationSelect, height = '300px' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default location (London)
  const defaultLat = 51.505;
  const defaultLng = -0.09;

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Check if Google Maps is already loaded
    if (checkGoogleMaps()) {
      return;
    }

    // Wait for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup interval after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!isLoaded) {
        setError('Failed to load Google Maps');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    try {
      // Determine initial position
      let initialLat = defaultLat;
      let initialLng = defaultLng;

      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          initialLat = lat;
          initialLng = lng;
        }
      }

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Create marker
      const marker = new window.google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map,
        draggable: true,
        title: 'Church Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#dc2626"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        }
      });

      markerRef.current = marker;

      // Add click listener to map
      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Update marker position
        marker.setPosition({ lat, lng });
        
        // Call callback with new coordinates
        onLocationSelect(lat.toFixed(6), lng.toFixed(6));
      });

      // Add drag listener to marker
      marker.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Call callback with new coordinates
        onLocationSelect(lat.toFixed(6), lng.toFixed(6));
      });

      // Add places search functionality
      const searchBox = document.createElement('input');
      searchBox.type = 'text';
      searchBox.placeholder = 'Search for a location...';
      searchBox.style.cssText = `
        box-sizing: border-box;
        border: 1px solid transparent;
        width: 240px;
        height: 32px;
        margin-top: 10px;
        padding: 0 12px;
        border-radius: 3px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        outline: none;
        text-overflow: ellipsis;
        background-color: #fff;
      `;

      map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(searchBox);

      const autocomplete = new window.google.maps.places.Autocomplete(searchBox);
      autocomplete.bindTo('bounds', map);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        marker.setPosition({ lat, lng });
        onLocationSelect(lat.toFixed(6), lng.toFixed(6));
      });

    } catch (err) {
      console.error('Error initializing Google Maps:', err);
      setError('Failed to initialize map');
    }
  }, [isLoaded, latitude, longitude, onLocationSelect]);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (!markerRef.current || !latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const newPosition = { lat, lng };
      markerRef.current.setPosition(newPosition);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(newPosition);
      }
    }
  }, [latitude, longitude]);

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-gray-300"
        style={{ height }}
      />
      <div className="mt-2 text-sm text-gray-600">
        <p className="font-medium">Instructions:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Click anywhere on the map to set the church location</li>
          <li>Drag the red marker to fine-tune the position</li>
          <li>Use the search box to find specific addresses</li>
          <li>Coordinates will update automatically in the form fields</li>
        </ul>
      </div>
    </div>
  );
}