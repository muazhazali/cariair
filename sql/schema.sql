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
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_ph ON products(ph_level);
CREATE INDEX IF NOT EXISTS idx_products_tds ON products(tds);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_status_brand ON products(status, brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status_source ON products(status, source_id);

-- Brand indexes
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(brand_name);
CREATE INDEX IF NOT EXISTS idx_brands_parent ON brands(parent_company);

-- Source indexes
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_country ON sources(country);
CREATE INDEX IF NOT EXISTS idx_sources_coordinates ON sources(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sources_kkm ON sources(kkm_approval_number);

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_image ON product_images(image_id);

-- Image indexes
CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);
CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC);

-- Manufacturer indexes
CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON manufacturers(name);

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

-- Insert default sources (coordinates from pb2.muaz.app)
INSERT INTO sources (source_name, type, location_address, country, kkm_approval_number, lat, lng) VALUES
('Taiping Underground Water', 'Underground', 'Lot 1466, Jalan Reservoir, Perak', 'Malaysia', 'KKM 163 (24/A/8)', 4.820186081133536, 100.75184611171122),
('Rembau Underground Water', 'Underground', 'Lot 1390, Kg. Chenong, Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/5)', 2.560198663760516, 102.13615162767921),
('Lenggeng Source', 'Underground', 'Lot 5043, Kg. Sompo, Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/1)', 2.831554105964163, 101.93045307566388),
('Bukit Jintan', 'Underground', 'PTD 6386, Bukit Jintan, Johor', 'Malaysia', 'KKM 163 (24/J/6)', 1.9862095301457197, 103.14957422986258),
('Pasuruan Source', 'Underground', 'Jl. Raya Pasuruan-Malang Km 10, East Java', 'Indonesia', 'KKM 163 24/B/62', -7.722849449616971, 112.8474605446182),
('Kanchong Aquifer', 'Oxygenated', 'Kompleks Al Ammar, Kg. Kanchong, Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/10)', 2.597368028746302, 101.97267517790938),
('Karak Source', 'Underground', 'Lot 7399, Jalan Mempaga, Pahang', 'Malaysia', 'KKM 163 (24/C/3)', 3.489984642845837, 102.01819322568949),
('Taiping Distillation Plant', 'Municipal', 'Lot 898, Jalan Reservoir, Perak', 'Malaysia', 'KKM 163 (52/A/1)', 4.820292995358648, 100.75225072847765),
('Shah Alam Plant', 'Municipal', 'Jalan Sitar 33/6, Selangor', 'Malaysia', NULL, 3.0212199123693626, 101.55494004409107),
('Ulu Tiram Plant', 'Municipal', 'Jalan Makmur, Johor', 'Malaysia', 'KKM 163 (52/J/41)', 1.5524826379613934, 103.83324293558218),
('Sibu Plant', 'Municipal', 'Lot 96, Upper Lanang, Sarawak', 'Malaysia', 'KKM 163 (52/Q/28)', 2.2414906381201196, 111.86811503558188),
('Clairvic Spring', 'Spring', 'Volvic (Puy de Dôme), Auvergne', 'France', 'KKM 163 (24/B/42)', 45.88881920216115, 3.061039408167735),
('Cachat Spring', 'Spring', 'Evian-les-Bains, Haute-Savoie', 'France', 'KKM 163 (24/B/3)', 46.39969829682801, 6.591648950983553)
ON CONFLICT DO NOTHING;

-- Insert default manufacturers
INSERT INTO manufacturers (id, name, address) VALUES
('c19c92a4-343c-468a-9e05-73a82fc81ec8', 'Spritzer Bhd', 'Lot 898, Jalan Reservoir, 34000 Taiping, Perak'),
('dd05de8e-8a2d-4f82-855f-62cde83a1ab1', 'OPM United Sdn Bhd', 'No. 15, Jalan Industri 2, Kawasan Perindustrian, 71800 Nilai, Negeri Sembilan'),
('ca419516-dcf8-4b83-aa38-a978379b2475', 'Cactus Beverage Sdn Bhd', 'Lot 1390, Kg. Chenong, 71250 Pasir Besar, Negeri Sembilan'),
('d93b8215-e34c-4c10-b22c-e9d8da3fe312', 'Cactus Beverage (Lenggeng)', 'Lot 5043, Kg. Sompo, 71750 Lenggeng, Negeri Sembilan'),
('5b74b717-48ee-415b-af29-fd7b3d134338', 'Mayora Indonesia', 'Jl. Raya Pasuruan-Malang Km 10, East Java, Indonesia'),
('fbf4d199-2203-4cd1-bae0-337d476407cc', 'Cactus Beverage (Johor)', 'PTD 6386, Bukit Jintan, 86000 Kluang, Johor'),
('970cfab5-e425-4187-b941-05267a216a95', 'Danone Indonesia', 'Jl. Raya Malang-Pandaan, Km 38, Lawang, Malang'),
('c84389b0-1549-45fd-9b3c-0a3745ebc5ef', 'Bubbles O2 Marketing', 'Kompleks Al Ammar, Lot PT 321, Kg. Kanchong, 42700 Banting, Selangor'),
('e5fe7a6b-e86a-49c8-8ad9-e2412b7532ac', 'DESA Mineral Water', 'Lot 7399, Jalan Mempaga, 28200 Lipis, Pahang'),
('38f610bf-ba2a-47c7-8319-b501edfb2bcb', 'Chuan Sin Sdn Bhd', 'Jalan Makmur, 81800 Ulu Tiram, Johor'),
('1523a6ea-8b45-4d47-8aab-f3c6068f2fd5', 'Summer Water Sdn Bhd', 'Lot 96, Upper Lanang, 96000 Sibu, Sarawak'),
('768e478c-51e0-4dfb-a4b5-f0b22d338a02', 'Danone France', 'Volvic (Puy de Dôme), Auvergne, France'),
('96c34206-43fe-486e-833e-a2526121f030', 'Danone Evian', 'Evian-les-Bains, Haute-Savoie, France')
ON CONFLICT DO NOTHING;

-- Insert products
INSERT INTO products (id, brand_id, manufacturer_id, source_id, product_name, barcode, ph_level, tds, minerals_json, status) VALUES
('fc1f3cac-311b-4903-88f8-56a5cb7eb9d9', '01c234f6-bdb7-4ca3-bf5c-50bfabe9c317', 'c19c92a4-343c-468a-9e05-73a82fc81ec8', '4433448e-ef13-488f-b84d-323efd5633a0', 'Natural Mineral Water', '9556145116058', 7.65, 160.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 2.4}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 31}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 2.7}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 9.9}, "SO4": {"name": "Sulphate", "unit": "mg/L", "amount": 4.9}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 104}, "SiO2": {"name": "Silica", "unit": "mg/L", "amount": 60}}', 'approved'),
('3a9a4faa-9d1d-473b-8eaa-7d345958b670', '977f0111-7882-4959-bef2-464676465908', 'dd05de8e-8a2d-4f82-855f-62cde83a1ab1', '8ee340b1-667e-46c1-b29c-c01748a622e0', 'Natural Mineral Water', '9555524003897', 7.30, 140.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 2.84}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 17.41}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 0.58}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 36.38}}', 'approved'),
('4cb01915-2a76-4622-bcea-4134855edb00', 'ed72ed84-3bf4-4034-9aa9-534b84448cf7', 'ca419516-dcf8-4b83-aa38-a978379b2475', 'b4920849-b063-497c-a448-c4eb2bc98758', 'Natural Mineral Water', '9556537002693', 7.10, 194.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 0.5}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 37.1}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 5.5}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 13.7}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 4.4}, "SO4": {"name": "Sulphate", "unit": "mg/L", "amount": 8.2}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 184}}', 'approved'),
('857026fe-2704-4916-bf1e-f4760ffd6a4c', '63b97028-ef64-4386-89fc-962505320eb4', 'd93b8215-e34c-4c10-b22c-e9d8da3fe312', '1567c2e5-707b-43c8-ab19-832cd84f03fc', 'Natural Mineral Water', '9556135015002', 7.00, 136.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 1.7}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 21.7}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 5.7}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 5.7}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 12.2}, "SO4": {"name": "Sulphate", "unit": "mg/L", "amount": 29.8}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 59}}', 'approved'),
('3c2bde7e-fe84-401d-b567-b578f7131b31', 'e4963bd5-1e66-41aa-b393-d3f65b11669e', '5b74b717-48ee-415b-af29-fd7b3d134338', '8ee340b1-667e-46c1-b29c-c01748a622e0', 'Natural Mineral Water', '9556570316856', 7.30, 120.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 3.4}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 21.09}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 1.5}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 0.91}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 19.81}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 99.45}}', 'approved'),
('bec52739-469d-418e-a273-058e7fd88d77', 'b4cf3f93-ad94-4dcc-b3ce-1a8bb79151a7', 'fbf4d199-2203-4cd1-bae0-337d476407cc', '1567c2e5-707b-43c8-ab19-832cd84f03fc', 'Natural Mineral Water', '9556135181509', 7.00, 136.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 1.7}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 21.7}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 5.7}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 5.7}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 12.2}, "SO4": {"name": "Sulphate", "unit": "mg/L", "amount": 29.8}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 59}}', 'approved'),
('e72803e3-be82-4448-b875-d89fe0a0990e', 'd1720477-b58e-4091-8606-cf25d4eb706c', '970cfab5-e425-4187-b941-05267a216a95', 'b34d588f-547f-4432-8563-b06cd5bca1d2', 'Natural Mineral Water', '8996001600269', 7.30, 132.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 1.5}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 2.2}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 2.7}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 5.5}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 48.5}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 120}}', 'approved'),
('635b1bb5-f0d6-4e50-b722-31306f53c753', 'c8526c6a-853d-44d0-bbd5-2350236a1710', 'c84389b0-1549-45fd-9b3c-0a3745ebc5ef', '34b89922-1aac-4b97-aec6-6029e0edad7c', 'Naturally Oxygenated Mineral Water', '9555978700267', 7.20, 152.00, '{"F": {"name": "Fluoride", "unit": "mg/L", "amount": 0.2}, "K": {"name": "Potassium", "unit": "mg/L", "amount": 0.4}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 27.1}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 6.8}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 8}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 140}}', 'approved'),
('09b61413-fd29-46f0-bb0f-a890d08ba29b', '01c234f6-bdb7-4ca3-bf5c-50bfabe9c317', 'c19c92a4-343c-468a-9e05-73a82fc81ec8', '8571c75e-f811-447f-826c-55f523613d31', 'Drinking Water (Distilled)', '9556145115051', 7.00, NULL, '{}', 'approved'),
('002e2e3f-86e4-4294-bc13-2da337a6a780', 'ff85eaa9-94e8-44d7-a730-32349701089c', 'c19c92a4-343c-468a-9e05-73a82fc81ec8', '60959af6-9ab7-4c07-bf59-54b90ab7219c', 'Drinking Water (RO)', NULL, NULL, NULL, '{}', 'approved'),
('3443327a-4cf2-4b7a-b429-5a67d1ca03cd', '74362d2a-e868-47aa-a0a4-fde98c4f10b8', 'e5fe7a6b-e86a-49c8-8ad9-e2412b7532ac', '357c8243-0144-4a28-85af-991511812a8e', 'Drinking Water', '9555819901228', NULL, NULL, '{}', 'approved'),
('6e3189d0-4206-4fd9-a100-b66b04ef4143', '03b9a09a-65b0-4525-9737-03e803ca1cc3', '38f610bf-ba2a-47c7-8319-b501edfb2bcb', '501bb7f9-b653-4bb7-a572-9e0d52757b39', 'Drinking Water (RO)', NULL, NULL, NULL, '{}', 'approved'),
('b2694dd3-be24-4ab1-a304-6fe603987cd1', '1020c35d-f118-4697-b046-941343cae4ce', '1523a6ea-8b45-4d47-8aab-f3c6068f2fd5', '3d51299e-9a7b-4ee9-880c-727333308c65', 'Natural Mineral Water', '3057640100178', 7.00, NULL, '{}', 'approved'),
('5b023f93-ae46-44a3-ae7f-f89664ef352f', '401b021c-425d-45ff-a6ed-f9bfab2affe1', '768e478c-51e0-4dfb-a4b5-f0b22d338a02', '85bb5cb0-5a96-41a5-b566-c6893ee78235', 'Natural Mineral Water', '3068320063003', 7.20, 345.00, '{"F": {"name": "Fluoride", "unit": "mg/L", "amount": 0.06}, "K": {"name": "Potassium", "unit": "mg/L", "amount": 1}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 80}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 10}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 26}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 6.5}, "NO3": {"name": "Nitrate", "unit": "mg/L", "amount": 3.8}, "SO4": {"name": "Sulphate", "unit": "mg/L", "amount": 14}, "HCO3": {"name": "Bicarbonate", "unit": "mg/L", "amount": 360}, "SiO2": {"name": "Silica", "unit": "mg/L", "amount": 15}}', 'approved'),
('bba603a0-bd7b-4df8-9047-60355b9665a1', 'd4b2d23d-7ac3-43d3-8b81-95aaaa6b48a3', '96c34206-43fe-486e-833e-a2526121f030', '18471608-7336-434c-8732-8b481a9021e1', 'Natural Mineral Water', '9556570316856', 7.40, 106.00, '{"K": {"name": "Potassium", "unit": "mg/L", "amount": 0.5}, "Ca": {"name": "Calcium", "unit": "mg/L", "amount": 21.6}, "Cl": {"name": "Chloride", "unit": "mg/L", "amount": 1.3}, "Mg": {"name": "Magnesium", "unit": "mg/L", "amount": 1}, "Na": {"name": "Sodium", "unit": "mg/L", "amount": 22.1}}', 'approved')
ON CONFLICT DO NOTHING;
