'use client';

import React, { useState } from 'react';
import { createAnalysis } from '@/app/actions/create-analysis';
import AddressSearch from '@/components/inputs/AddressSearch';
import PropertyTypeSelector, { PropertyType } from '@/components/inputs/PropertyTypeSelector';
import { Save, Loader2, ArrowRight, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Progressive Disclosure State
  
  // Form State
  const [geoData, setGeoData] = useState<{
    googlePlaceId: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  const [propType, setPropType] = useState<PropertyType>('Multifamily');

  const handleAddressSelect = (data: any) => {
    setGeoData({
      ...data,
      name: data.formattedAddress.split(',')[0] // Default name to Street Address
    });
    setStep(2); // Reveal the rest of the form
  };

  return (
    <main className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
      
      {/* Brand / Hero */}
      <div className='sm:mx-auto sm:w-full sm:max-w-md text-center mb-10'>
        <div className='flex justify-center mb-4'>
          <div className='p-3 bg-blue-600 rounded-xl shadow-lg'>
            <TrendingUp className='w-8 h-8 text-white' />
          </div>
        </div>
        <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
          ContextCore
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          Professional Real Estate Investment Engine
        </p>
      </div>

      <div className='sm:mx-auto sm:w-full sm:max-w-2xl'>
        <div className='bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 relative overflow-hidden'>
          
          {/* Progress Indicator */}
          <div className='absolute top-0 left-0 w-full h-1 bg-gray-100'>
            <div 
              className='h-full bg-blue-600 transition-all duration-500 ease-out'
              style={{ width: step === 1 ? '30%' : '100%' }}
            />
          </div>

          <form action={createAnalysis} onSubmit={() => setIsSubmitting(true)} className='space-y-8'>
            
            {/* STEP 1: LOCATION (Always Visible) */}
            <div className='space-y-4'>
              <div className='text-center sm:text-left'>
                <h3 className='text-lg font-medium leading-6 text-gray-900'>1. Identify Asset</h3>
                <p className='text-sm text-gray-500'>Search by address to auto-calibrate location data.</p>
              </div>
              
              <div className='relative z-20'>
                <AddressSearch onAddressSelect={handleAddressSelect} />
              </div>
              
              {/* Hidden Inputs for Server Action */}
              {geoData && (
                <>
                  <input type='hidden' name='googlePlaceId' value={geoData.googlePlaceId} />
                  <input type='hidden' name='formattedAddress' value={geoData.formattedAddress} />
                  <input type='hidden' name='latitude' value={geoData.latitude} />
                  <input type='hidden' name='longitude' value={geoData.longitude} />
                  <input type='hidden' name='name' value={geoData.name} /> 
                </>
              )}
            </div>

            {/* STEP 2: FINANCIALS (Revealed on Selection) */}
            {step === 2 && (
              <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                
                <div className='border-t border-gray-100 pt-8'>
                  <div className='mb-4'>
                    <h3 className='text-lg font-medium leading-6 text-gray-900'>2. Asset Class</h3>
                  </div>
                  <PropertyTypeSelector value={propType} onChange={setPropType} />
                  <input type='hidden' name='propertyType' value={propType} />
                </div>

                <div className='border-t border-gray-100 pt-8'>
                   <div className='mb-4'>
                    <h3 className='text-lg font-medium leading-6 text-gray-900'>3. Financial Baseline</h3>
                  </div>
                  <div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>Purchase Price</label>
                      <div className='mt-1 relative rounded-md shadow-sm'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <span className='text-gray-500 sm:text-sm'>$</span>
                        </div>
                        <input
                          type='number'
                          name='purchasePrice'
                          required
                          className='focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3 border'
                          placeholder='0.00'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>Annual NOI</label>
                      <div className='mt-1 relative rounded-md shadow-sm'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <span className='text-gray-500 sm:text-sm'>$</span>
                        </div>
                        <input
                          type='number'
                          name='noi'
                          required
                          className='focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3 border'
                          placeholder='0.00'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='border-t border-gray-100 pt-8'>
                   <div className='mb-4'>
                    <h3 className='text-lg font-medium leading-6 text-gray-900'>4. Thesis & Notes</h3>
                  </div>
                  <textarea
                    name='notes'
                    rows={3}
                    className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border'
                    placeholder='Value-add strategy, market conditions, etc...'
                  />
                </div>

                <div className='pt-4'>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.01] active:scale-[0.99]'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center gap-2'><Loader2 className='animate-spin w-5 h-5'/> Processing Deal...</span>
                    ) : (
                      <span className='flex items-center gap-2'>Generate Deal Report <ArrowRight className='w-5 h-5'/></span>
                    )}
                  </button>
                </div>

              </div>
            )}

            {step === 1 && (
               <div className='text-center pt-8 opacity-50 text-sm'>
                 Select a location above to begin analysis
               </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}