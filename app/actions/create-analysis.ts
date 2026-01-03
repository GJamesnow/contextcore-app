'use server';

import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createAnalysis(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    purchasePrice: parseFloat(formData.get('purchasePrice') as string),
    noi: parseFloat(formData.get('noi') as string),
    notes: formData.get('notes') as string,
    googlePlaceId: formData.get('googlePlaceId') as string,
    formattedAddress: formData.get('formattedAddress') as string,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    propertyType: formData.get('propertyType') as string,
  };

  // Validation: Ensure we actually have the location lock
  if (!rawData.googlePlaceId || !rawData.latitude) {
    throw new Error('Analysis failed: No valid location selected.');
  }

  const newDeal = await prisma.assetAnalysis.create({
    data: rawData,
  });

  redirect(\/analysis/\\);
}