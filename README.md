# Health Analytics Dashboard API

REST API for patient biomarker analytics built with **TypeScript** and **Express**.

## Tech Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5 (strict mode)
- **Framework**: Express 4
- **Architecture**: MVC — Routes → Services → Data

## Getting Started

```bash
# Install dependencies
npm install

# Run in development (with hot-reload via ts-node)
npm run dev

# Build & run production
npm run build
npm start
```

The API will be available at `http://localhost:3000`.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/patients` | List all patients |
| `GET` | `/api/patients/:id` | Get patient details + biomarkers |
| `GET` | `/api/patients/:id/summary` | Computed health score & stats |
| `GET` | `/api/patients/:id/anomalies` | Biomarkers outside reference range |

## Example Response

```json
GET /api/patients/p-001/summary

{
  "success": true,
  "data": {
    "patientId": "p-001",
    "totalBiomarkers": 4,
    "normalCount": 2,
    "abnormalCount": 2,
    "criticalCount": 0,
    "overallScore": 75,
    "generatedAt": "2025-05-12T19:00:00.000Z"
  },
  "timestamp": "2025-05-12T19:00:00.000Z"
}
```

## Project Structure

```
src/
├── data/           # Seed data (replace with DB adapters)
├── routes/         # Express route handlers
├── services/       # Pure business logic (testable)
└── types/          # TypeScript domain types
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=3000
```

## Author
Emmanuel García — [emmanuelg@allcognition.com](mailto:emmanuelg@allcognition.com)
