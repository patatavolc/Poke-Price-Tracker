CREATE TABLE sets (
  id TEXT PRIMARY KEY, 
  name TEXT NOT NULL,
  series TEXT,         
  release_date DATE,
  logo_url TEXT,
  symbol_url TEXT,
  card_count INTEGER
);

CREATE TABLE cards (
  id TEXT PRIMARY KEY, 
  name TEXT NOT NULL,
  rarity TEXT,
  image_url TEXT,      
  local_id TEXT,       
  set_id TEXT REFERENCES sets(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_priority INTEGER DEFAULT 1,
  last_signifficant_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();
);

CREATE TABLE price_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD', 
  source TEXT,                 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, 
  card_id TEXT REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_id) 
);

CREATE INDEX idx_price_history_card_date ON price_history(card_id, created_at);