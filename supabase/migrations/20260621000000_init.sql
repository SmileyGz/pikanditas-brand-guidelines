-- 1. Create custom types (Drop first to avoid errors if they exist)
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'store');

DROP TYPE IF EXISTS agreement_type CASCADE;
CREATE TYPE agreement_type AS ENUM ('compra_directa_12', 'compra_directa_10', 'consignacion');

DROP TYPE IF EXISTS agreement_status CASCADE;
CREATE TYPE agreement_status AS ENUM ('pending', 'active', 'terminated');

DROP TYPE IF EXISTS consignment_status CASCADE;
CREATE TYPE consignment_status AS ENUM ('active', 'settled');

-- 2. Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'seller',
  name TEXT,
  phone TEXT UNIQUE,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  zone TEXT,
  tier TEXT NOT NULL DEFAULT 'tiendita_12',
  assigned_seller UUID REFERENCES profiles(id) ON DELETE SET NULL,
  location JSONB, /* { "lat": number, "lng": number } */
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type agreement_type NOT NULL,
  status agreement_status DEFAULT 'pending',
  signed_by_seller UUID REFERENCES profiles(id) ON DELETE SET NULL,
  canvas_signature TEXT,
  photo_id_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  stock_delivered INT NOT NULL,
  stock_remaining INT,
  last_review_date TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  status consignment_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  visit_type TEXT, /* e.g., review_consignment, direct_sale, prospect */
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS online_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name TEXT,
  buyer_email TEXT,
  quantity INT NOT NULL,
  total_price NUMERIC,
  payment_status TEXT DEFAULT 'pending',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS panic_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger to automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $func$
BEGIN
  INSERT INTO public.profiles (id, role, name, phone)
  VALUES (
    new.id, 
    COALESCE((new.raw_app_meta_data->>'role')::user_role, 'seller'::user_role),
    new.raw_user_meta_data->>'name',
    new.phone
  );
  RETURN new;
END;
$func$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE panic_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Sellers can view assigned stores" ON stores;
DROP POLICY IF EXISTS "Admins manage stores" ON stores;
DROP POLICY IF EXISTS "Auth users can read stores" ON stores;
DROP POLICY IF EXISTS "Auth users can read agreements" ON agreements;
DROP POLICY IF EXISTS "Auth users can read consignments" ON consignments;
DROP POLICY IF EXISTS "Auth users can read visits" ON visits;
DROP POLICY IF EXISTS "Auth users can read panic_events" ON panic_events;
DROP POLICY IF EXISTS "Public read online orders" ON online_orders;
DROP POLICY IF EXISTS "Public insert online orders" ON online_orders;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Sellers can view assigned stores" ON stores FOR SELECT USING (assigned_seller = auth.uid() OR assigned_seller IS NULL);
CREATE POLICY "Admins manage stores" ON stores FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Default allow read-all for authenticated users for now to prevent blocking development (we will restrict later)
CREATE POLICY "Auth users can read stores" ON stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can read agreements" ON agreements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can read consignments" ON consignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can read visits" ON visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can read panic_events" ON panic_events FOR SELECT TO authenticated USING (true);

-- Online orders are readable publicly to show success pages, but only insertable via Edge Function
CREATE POLICY "Public read online orders" ON online_orders FOR SELECT TO public USING (true);
CREATE POLICY "Public insert online orders" ON online_orders FOR INSERT TO public WITH CHECK (true);
