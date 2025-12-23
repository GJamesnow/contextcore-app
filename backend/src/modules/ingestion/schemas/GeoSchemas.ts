import { z } from 'zod';

export const GeoIngestionRequestSchema = z.object({
    placeId: z.string().min(5, "Invalid Google Place ID format"),
    requestedBy: z.string().uuid().optional(),
});

export const AxiomPropertyManifestSchema = z.object({
    id: z.string().uuid(),
    sourceType: z.literal('GEO_MAP'),
    meta: z.object({
        formattedAddress: z.string(),
        placeId: z.string(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number(),
        }),
        ingestedAt: z.string().datetime(),
    }),
    rawSourceData: z.record(z.any()),
    status: z.enum(['PENDING', 'PROCESSING', 'FAILED']),
});

export type GeoIngestionRequest = z.infer<typeof GeoIngestionRequestSchema>;
export type AxiomPropertyManifest = z.infer<typeof AxiomPropertyManifestSchema>;
