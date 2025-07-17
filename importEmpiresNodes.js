const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres',         // your postgres username
  host: 'localhost',
  database: 'bible_db',
  password: 'Pos3060100', // replace with your password
  port: 5432,
});

async function importData() {
  await client.connect();
  const data = JSON.parse(fs.readFileSync('public/data/studies/flare-OldTestamentJesus1.json', 'utf8'));
  for (const node of data) {
    await client.query(
      'INSERT INTO oldtestamentsjesus1 (name, imports) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [node.name, JSON.stringify(node.imports)]
    );
  }
  await client.end();
  console.log('Import complete!');
}

importData();