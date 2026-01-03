import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = process.env.PORT || 3001;

// Allow Frontend Access
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST'] }));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.status(200).send('OK'); 
});

// GET: Fetch Telemetry (With Time Filtering)
app.get('/api/logs', async (req, res) => {
  try {
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
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database Error" });
  }
});

// POST: Inject Telemetry
app.post('/api/logs', async (req, res) => {
  try {
    const { source, lat, lng, message } = req.body;
    if (!source || !lat || !lng) return res.status(400).json({ error: "Missing Fields" });
    
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
    res.json(result.rows[0]);
    console.log(`[AXIOM] Ingested: ${source}`);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ingestion Failed" });
  }
});

// STARTS THE SERVER
app.listen(port, () => { 
  console.log(`>>> AXIOM CORE LISTENING ON PORT ${port}`); 
});