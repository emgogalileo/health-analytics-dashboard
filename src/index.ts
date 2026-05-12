import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock data
const healthData = {
    patientsProcessed: 1250,
    averageHealthScore: 85.4,
    criticalCases: 12,
    recentBiomarkers: [
        { id: 'b1', name: 'Cholesterol', status: 'Optimal' },
        { id: 'b2', name: 'Glucose', status: 'Warning' },
        { id: 'b3', name: 'Vitamin D', status: 'Deficient' }
    ]
};

app.get('/api/health-metrics', (req: Request, res: Response) => {
    res.json(healthData);
});

app.get('/api/status', (req: Request, res: Response) => {
    res.json({ status: 'online', service: 'Health Analytics Dashboard API' });
});

app.listen(port, () => {
    console.log(`Health Analytics API is running on port ${port}`);
});
