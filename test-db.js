import pkg from 'pg'
const { Client } = pkg

const client = new Client({
  connectionString: 'postgresql://postgres:Smileygonla1%23@db.nggmaelmanlxdpattdid.supabase.co:5432/postgres'
})

async function run() {
  await client.connect()
  const users = await client.query('SELECT id, email, phone FROM auth.users')
  console.log('AUTH USERS:', users.rows)
  const profiles = await client.query('SELECT id, role, name, phone FROM public.profiles')
  console.log('PROFILES:', profiles.rows)
  await client.end()
}
run().catch(console.error)
