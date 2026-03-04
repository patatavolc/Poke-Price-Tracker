CREATE TABLE sets (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  series VARCHAR(255) NOT NULL,
  total INTEGER NOT NULL,
  release_date DATE,
  symbol_url TEXT,
  logo_url TEXT
);

CREATE TABLE cards (
  id VARCHAR(50) PRIMARY KEY,
  set_id VARCHAR(50) REFERENCES sets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  supertype VARCHAR(100),
  subtypes TEXT[],
  types TEXT[],
  artist VARCHAR(255),
  rarity VARCHAR(100),

  image_small TEXT,
  image_large TEXT,

  tcgplayer_url TEXT,
  cardmarket_url TEXT,

  last_price_eur DECIMAL(10, 2),
  last_price_usd DECIMAL(10, 2),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

CREATE TABLE price_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id VARCHAR(50) REFERENCES cards(id) ON DELETE CASCADE,
  price_eur DECIMAL(10, 2) NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',

  coins INTEGER DEFAULT 1000,
  token_version INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

CREATE TABLE user_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_id VARCHAR(50) REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS cards_without_price (
  card_id VARCHAR(50) PRIMARY KEY REFERENCES cards(id) ON DELETE CASCADE,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp,
  attempt_count INTEGER DEFAULT 1,
  last_error TEXT,
  source_failures JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp
);

-- Indice para buscar todas las cartas de un set especifico
CREATE INDEX idx_cards_set_id ON cards(set_id);

-- Indice para cargar el historial de precios de una carta
CREATE INDEX idx_price_history_card_id ON price_history(card_id);

-- Indice para cargar la coleccion de un usuario especifico
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);

-- Indice para saber que usuarios tienen una carta especifica
CREATE INDEX idx_user_cards_cards_id ON user_cards(card_id);

-- Indice para buscar cartas por nombre
CREATE INDEX idx_cards_name ON cards(name);

-- Indice para filtrar por rareza o tipos
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_supertype ON cards(supertype);

-- Indice para obtener los precios mas recientes rapidamente
CREATE INDEX idx_price_history_created_at ON price_history(created_at DESC);

-- Indice para optimizar la busqueda de una carta especifica dentro de la coleccion de un usuario
CREATE UNIQUE INDEX idx_user_card_unique ON user_cards(user_id, card_id);

-- Indice para buscar cartas por fecha de ultimo intento
CREATE INDEX idx_cards_without_price_last_attempt ON cards_without_price(last_attempt);

-- Indice para contar intentos
CREATE INDEX idx_cards_without_price_attempt_count ON cards_without_price(attempt_count);


-- Actualizar el precio actual automaticamente
CREATE OR REPLACE FUNCTION update_last_card_price()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cards
  SET last_price_eur = NEW.price_eur,
      last_price_usd = NEW.price_usd,
      updated_at = NEW.created_at
  WHERE id = NEW.card_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_card_price
AFTER INSERT ON price_history
FOR EACH ROW
EXECUTE FUNCTION update_last_card_price();

-- Actualiza el updated_at de los usuarios
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Vistas

-- Vista de la coleccion completa
CREATE VIEW v_user_collection AS
SELECT 
    uc.user_id,
    c.id AS card_id,
    c.name,
    c.image_small,
    c.rarity,
    s.name AS set_name,
    uc.quantity,
    c.last_price_eur,
    (c.last_price_eur * uc.quantity) AS total_value_eur,
    uc.obtained_at
FROM user_cards uc
JOIN cards c ON uc.card_id = c.id
JOIN sets s ON c.set_id = s.id;

-- Procedimiento para abrir sobre
-- Añade una carta a la coleccion, si el usuario ya la tiene, aumenta la cantidad, sino la inserta
CREATE OR REPLACE PROCEDURE add_card_to_user(
    p_user_id INTEGER,
    p_card_id VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_cards (user_id, card_id, quantity)
    VALUES (p_user_id, p_card_id, 1)
    ON CONFLICT (user_id, card_id) 
    DO UPDATE SET quantity = user_cards.quantity + 1;
END;
$$;