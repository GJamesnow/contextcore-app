import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. POST: Ingest Data
  if (req.method === 'POST') {
    try {
      const { source, lat, lng, message } = req.body;
      if (!source || !lat || !lng) return res.status(400).json({ error: "Missing Fields" });

      // Lazy Table Creation
      // The backticks below are now protected from PowerShell
      await pool.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id SERIAL PRIMARY KEY,
          source VARCHAR(50),
          lat DECIMAL,
          lng DECIMAL,
          message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const result = await pool.query(
        'INSERT INTO logs (source, lat, lng, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [source, lat, lng, message]
      );
      
      console.log(`[AXIOM API] Ingested: ${source}`);
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Ingestion Failed" });
    }
  }

  // 2. GET: Fetch Data (With Time Filtering)
  if (req.method === 'GET') {
    try {
      // Safety Check
      const tableCheck = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'logs')");
      if (!tableCheck.rows[0].exists) { return res.json([]); }

      const { start, end } = req.query;
      let queryText = 'SELECT * FROM logs';
      const queryParams: any[] = [];

      if (start && end) {
          queryText += ' WHERE created_at >= $1 AND created_at <= $2';
          queryParams.push(start);
          queryParams.push(end);
      }

      queryText += ' ORDER BY created_at DESC LIMIT 500';

      const result = await pool.query(queryText, queryParams);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Database Error" });
    }
  }

  // 3. Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}