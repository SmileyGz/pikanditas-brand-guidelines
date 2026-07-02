import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

// You'll need to run this with dotenv or pass env vars
import * as dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const kmlContent = fs.readFileSync('/Users/josegonzalez/.gemini/antigravity/brain/d7d7ef82-d485-48f9-99e0-10cda3cba90f/.system_generated/steps/1362/content.md', 'utf8')

// Quick regex parsing for Placemarks
const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g
let match
const stores = []

while ((match = placemarkRegex.exec(kmlContent)) !== null) {
  const block = match[1]
  
  const nameMatch = block.match(/<name>(.*?)<\/name>/)
  const descMatch = block.match(/<description>(.*?)<\/description>/)
  const coordMatch = block.match(/<coordinates>\s*([^<]+)\s*<\/coordinates>/)

  if (nameMatch && coordMatch) {
    const name = nameMatch[1].trim()
    if (name === 'Ruta' || name === 'Martes' || name === 'Miercoles') continue // skip generic routing pins

    const coords = coordMatch[1].trim().split(',')
    const lng = parseFloat(coords[0])
    const lat = parseFloat(coords[1])
    
    let phone = ''
    let owner_name = ''
    if (descMatch) {
      const desc = descMatch[1].replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ').trim()
      // Extract phone if 10 digits exist
      const phoneExtract = desc.match(/\d{10}/)
      if (phoneExtract) {
        phone = phoneExtract[0]
        owner_name = desc.replace(phone, '').trim()
      } else {
        owner_name = desc
      }
    }

    stores.push({
      name,
      owner_name,
      phone,
      location: { lat, lng },
      tier: 'tiendita_12',
      visit_day: 'Viernes' // Default fallback
    })
  }
}

console.log(`Found ${stores.length} valid stores to insert.`)

async function run() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@pikanditas.com',
    password: 'PikanditasAdmin2024!' // Standard admin password
  })
  if (authErr) console.log("Auth warning:", authErr.message)

  let inserted = 0
  for (const store of stores) {
    // Check if it exists to avoid duplicates
    const { data: existing } = await supabase.from('stores').select('id').eq('name', store.name).single()
    if (!existing) {
      const { error } = await supabase.from('stores').insert([store])
      if (error) {
        console.error(`Error inserting ${store.name}:`, error)
      } else {
        console.log(`Inserted ${store.name}`)
        inserted++
      }
    } else {
      console.log(`Skipped ${store.name} (Already exists)`)
    }
  }
  console.log(`Done! Inserted ${inserted} new stores.`)
}

run()
