import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      assigned_seller:profiles ( name, phone )
    `)
    .limit(1)

  if (error) console.error("ERROR:", error)
  else console.log("DATA:", data)
}

test()
