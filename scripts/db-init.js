import fs from 'fs'
import pkg from 'pg'
const { Client } = pkg

const sqlFile = '/Users/josegonzalez/.gemini/antigravity/brain/d7d7ef82-d485-48f9-99e0-10cda3cba90f/supabase_schema.sql.md'
let sql = fs.readFileSync(sqlFile, 'utf8')

// Remove markdown formatting if any
if (sql.startsWith('```sql')) {
  sql = sql.replace(/^```sql\n/, '').replace(/```$/, '')
}

const client = new Client({
  connectionString: 'postgresql://postgres:Smileygonla1%23@db.nggmaelmanlxdpattdid.supabase.co:5432/postgres'
})

async function run() {
  try {
    console.log('Connecting to Supabase DB...')
    await client.connect()
    console.log('Connected! Running SQL...')
    await client.query(sql)
    console.log('✅ Setup complete!')
  } catch (err) {
    console.error('❌ Error executing SQL:', err)
  } finally {
    await client.end()
  }
}
run()
