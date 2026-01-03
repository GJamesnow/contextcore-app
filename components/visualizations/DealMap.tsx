'use client';

import React from 'react';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  draggable: true,
  scrollwheel: false,
};

interface DealMapProps {
  latitude: number;
  longitude: number;
}

export default function DealMap({ latitude, longitude }: DealMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  });

  if (loadError) return <div className='flex items-center justify-center h-full text-red-500 bg-red-50'>Map Error</div>;
  if (!isLoaded) return <div className='flex items-center justify-center h-full bg-gray-50'><Loader2 className='animate-spin text-gray-400' /></div>;

  const center = { lat: latitude, lng: longitude };

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={15}
      options={MAP_OPTIONS}
    >
      <MarkerF position={center} />
    </GoogleMap>
  );
}