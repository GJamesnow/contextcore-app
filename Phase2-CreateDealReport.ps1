# Phase2-CreateDealReport.ps1
# Axiom Architect: Generates Deal Report Page & Map Visualization

$ErrorActionPreference = "Stop"
Write-Host ">>> AXIOM: GENERATING DEAL REPORT INFRASTRUCTURE..." -ForegroundColor Cyan

# 1. DIRECTORY SETUP
$dirs = @("components/visualizations", "app/analysis/[id]")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host ">>> Created directory: $dir" -ForegroundColor Green
    }
}

# 2. COMPONENT: READ-ONLY MAP (DealMap.tsx)
$mapPath = "components/visualizations/DealMap.tsx"
# We use a standard string here to avoid nested Here-String conflicts in this one-shot generator
$mapContent = "
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
"
[System.IO.File]::WriteAllText($mapPath, $mapContent.Trim())
Write-Host ">>> Generated Component: $mapPath" -ForegroundColor Green

# 3. PAGE: DYNAMIC DEAL REPORT (page.tsx)
$pagePath = "app/analysis/[id]/page.tsx"
$pageContent = "
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client'; 
import DealMap from '@/components/visualizations/DealMap';
import { Building2, MapPin, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function DealReportPage({ params }: PageProps) {
  const { id } = params;

  const asset = await prisma.assetAnalysis.findUnique({
    where: { id },
  });

  if (!asset) {
    notFound();
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <main className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-5xl mx-auto space-y-6'>
        
        {/* Header / Nav */}
        <div className='flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            Back to Dashboard
          </Link>
          
          <button className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm'>
            <Share2 className='w-4 h-4' />
            Share Deal
          </button>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          
          {/* Left Col: Asset Details */}
          <div className='lg:col-span-2 space-y-6'>
            
            {/* Title Card */}
            <div className='p-6 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='flex items-start justify-between'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='px-2.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full'>
                      {asset.propertyType || 'Investment'}
                    </span>
                  </div>
                  <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
                    {asset.name}
                  </h1>
                  <div className='flex items-center gap-2 mt-2 text-gray-500'>
                    <MapPin className='w-4 h-4' />
                    <span className='text-sm'>{asset.formattedAddress || 'Address not available'}</span>
                  </div>
                </div>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <Building2 className='w-8 h-8 text-gray-400' />
                </div>
              </div>
            </div>

            {/* Financials Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='p-5 bg-white rounded-xl shadow-sm border border-gray-100'>
                <p className='text-sm font-medium text-gray-500'>Purchase Price</p>
                <p className='mt-1 text-2xl font-bold text-gray-900'>{formatCurrency(asset.purchasePrice)}</p>
              </div>
              <div className='p-5 bg-white rounded-xl shadow-sm border border-gray-100'>
                <p className='text-sm font-medium text-gray-500'>NOI (Annual)</p>
                <p className='mt-1 text-2xl font-bold text-green-600'>{formatCurrency(asset.noi)}</p>
              </div>
              <div className='p-5 bg-white rounded-xl shadow-sm border border-gray-100'>
                <p className='text-sm font-medium text-gray-500'>Cap Rate</p>
                <p className='mt-1 text-2xl font-bold text-blue-600'>
                  {((asset.noi / asset.purchasePrice) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            
            {/* Notes Section */}
            <div className='p-6 bg-white rounded-xl shadow-sm border border-gray-100'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>Analysis Notes</h3>
              <p className='text-gray-600 whitespace-pre-wrap leading-relaxed'>
                {asset.notes || 'No notes provided for this deal.'}
              </p>
            </div>
          </div>

          {/* Right Col: Map & Visuals */}
          <div className='lg:col-span-1'>
            <div className='sticky top-6 space-y-6'>
              {/* Map Card */}
              <div className='overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 h-80'>
                {asset.latitude && asset.longitude ? (
                  <DealMap latitude={asset.latitude} longitude={asset.longitude} />
                ) : (
                  <div className='flex items-center justify-center h-full text-gray-400 bg-gray-50'>
                    <div className='text-center'>
                      <MapPin className='w-8 h-8 mx-auto mb-2 opacity-50' />
                      <span className='text-sm'>No Geolocation Data</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className='p-6 bg-blue-900 text-white rounded-xl shadow-lg'>
                <h3 className='font-semibold text-lg mb-2'>Interested in this asset?</h3>
                <p className='text-blue-200 text-sm mb-4'>Contact the deal sponsor for full underwriting details.</p>
                <button className='w-full py-2.5 text-sm font-medium text-blue-900 bg-white rounded-lg hover:bg-blue-50 transition-colors'>
                  Request Info
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
"
[System.IO.File]::WriteAllText($pagePath, $pageContent.Trim())
Write-Host ">>> Generated Page: $pagePath" -ForegroundColor Green
Write-Host ">>> DEPLOYMENT COMPLETE." -ForegroundColor Cyan
