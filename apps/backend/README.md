# Flare Bible Study Backend API

Express.js backend API for Flare Bible Study with PostgreSQL database and D3 visualization support.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Your database password: `Pos3060100`

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb bible_db
   
   # Run the setup script
   psql -d bible_db -f database/setup.sql
   ```

3. **Import your data:**
   ```bash
   npm run import
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Bible Data
- `GET /api/bible/oldtestamentjesus1` - Get all data
- `GET /api/bible/oldtestamentjesus1/filter?name=vision&imports=test` - Filter data
- `GET /api/bible/oldtestamentjesus1/visualization` - Get data formatted for D3

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bible_db
DB_USER=postgres
DB_PASSWORD=Pos3060100
PORT=3001
```

## 📁 Project Structure

```
apps/backend/
├── config/
│   └── db.js              # Database configuration
├── routes/
│   └── bibleData.js       # API routes
├── scripts/
│   └── importData.js      # Data import script
├── database/
│   └── setup.sql          # Database setup
├── .env                   # Environment variables
├── index.js              # Main server file
└── package.json
```

## 🎯 D3 Visualization Data

The `/api/bible/oldtestamentjesus1/visualization` endpoint returns data formatted for D3:

```json
{
  "success": true,
  "nodes": [
    {
      "id": 0,
      "name": "vision.Jesus. Jesus",
      "imports": []
    }
  ],
  "links": [
    {
      "source": 2,
      "target": 1,
      "value": 1
    }
  ],
  "nodeCount": 4,
  "linkCount": 1
}
```

## 🔍 Database Schema

```sql
CREATE TABLE oldtestamentjesus1 (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    imports JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development

- **Auto-reload:** `npm run dev`
- **Import data:** `npm run import`
- **Start server:** `npm start`

## 📝 Notes

- The API uses JSONB for the `imports` field to support complex queries
- CORS is enabled for frontend integration
- Error handling is implemented for all endpoints
- Data is automatically formatted for D3 visualization 