import { PrismaClient, GeoLog } from "@prisma/client";
const prisma = new PrismaClient();
export class GeoService {
  public async warmup() { await prisma.$connect(); }
  private calculateMarketScore(lat: number, lng: number): number {
    const anchorLat = 40.7128; const anchorLng = -74.0060;
    const distance = Math.sqrt(Math.pow(lat - anchorLat, 2) + Math.pow(lng - anchorLng, 2));
    return parseFloat(Math.max(0, 100 - (distance * 100)).toFixed(2));
  }
  public async ingestCoordinates(lat: number, lng: number, source: string): Promise<GeoLog> {
    const score = this.calculateMarketScore(lat, lng);
    return await prisma.geoLog.create({
      data: { latitude: lat, longitude: lng, source, marketScore: score, status: score > 75 ? "HOT" : "MONITOR" }
    });
  }
  public async getRecentLogs(limit: number = 10): Promise<GeoLog[]> {
    return prisma.geoLog.findMany({ take: limit, orderBy: { timestamp: 'desc' } });
  }
}