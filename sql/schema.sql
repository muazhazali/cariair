-- ==========================================
-- CariAir PostgreSQL Schema
-- Migration from PocketBase
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- AUTH TABLES (NextAuth.js Compatible)
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    name VARCHAR(255),
    image TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table (OAuth linking)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ==========================================
-- DATA TABLES
-- ==========================================

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name VARCHAR(100) NOT NULL,
    parent_company VARCHAR(100),
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100),
    type VARCHAR(50) CHECK (type IN ('Underground', 'Spring', 'Municipal', 'Oxygenated')),
    location_address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    kkm_approval_number VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Malaysia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table (BYTEA storage)
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    data BYTEA NOT NULL,
    size_bytes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id),
    manufacturer_id UUID REFERENCES manufacturers(id),
    source_id UUID REFERENCES sources(id),
    submitted_by UUID REFERENCES users(id),
    product_name VARCHAR(150),
    barcode VARCHAR(50),
    ph_level DECIMAL(4, 2),
    tds DECIMAL(6, 2),
    minerals_json JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images junction table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, sort_order)
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_submitted_by ON products(submitted_by);

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Product images index
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert default brands
INSERT INTO brands (brand_name, parent_company) VALUES
('Spritzer', 'Spritzer Group'),
('ASK', 'OPM United'),
('Dasani', 'The Coca-Cola Company'),
('Cactus', 'Spritzer Group'),
('Ice Mountain', 'F&N'),
('DESA', 'Desa Mineral Water'),
('Le Minerale', 'Mayora Group'),
('Bubbles O2', 'Bubbles O2 Marketing'),
('Borneo Springs', 'Borneo Springs Sdn Bhd'),
('Summer', 'Chuan Sin Sdn Bhd'),
('TOPVALU', 'AEON'),
('MOMA', 'MOMA Water'),
('Volvic', 'Danone'),
('evian', 'Danone')
ON CONFLICT DO NOTHING;

-- Insert default sources
INSERT INTO sources (source_name, type, location_address, country, kkm_approval_number) VALUES
('Taiping Underground Water', 'Underground', 'Lot 1466, Jalan Reservoir, Perak', 'Malaysia', 'KKM 163 (24/A/8)'),
('Rembau Underground Water', 'Underground', 'Lot 1390, Kg. Chenong, Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/5)'),
('Lenggeng Source', 'Underground', 'Lot 5043, Kg. Sompo, Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/1)'),
('Bukit Jintan', 'Underground', 'PTD 6386, Bukit Jintan, Johor', 'Malaysia', 'KKM 163 (24/J/6)'),
('Pasuruan Source', 'Underground', 'Jl. Raya Pasuruan-Malang Km 10, East Java', 'Indonesia', 'KKM 163 24/B/62'),
('Kanchong Aquifer', 'Oxygenated', 'Kompleks Al Ammar, Kg. Kanchong, Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/10)'),
('Karak Source', 'Underground', 'Lot 7399, Jalan Mempaga, Pahang', 'Malaysia', 'KKM 163 (24/C/3)'),
('Taiping Distillation Plant', 'Municipal', 'Lot 898, Jalan Reservoir, Perak', 'Malaysia', 'KKM 163 (52/A/1)'),
('Shah Alam Plant', 'Municipal', 'Jalan Sitar 33/6, Selangor', 'Malaysia', NULL),
('Ulu Tiram Plant', 'Municipal', 'Jalan Makmur, Johor', 'Malaysia', 'KKM 163 (52/J/41)'),
('Sibu Plant', 'Municipal', 'Lot 96, Upper Lanang, Sarawak', 'Malaysia', 'KKM 163 (52/Q/28)'),
('Clairvic Spring', 'Spring', 'Volvic (Puy de Dôme), Auvergne', 'France', 'KKM 163 (24/B/42)'),
('Cachat Spring', 'Spring', 'Evian-les-Bains, Haute-Savoie', 'France', 'KKM 163 (24/B/3)')
ON CONFLICT DO NOTHING;
