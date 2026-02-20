-- ==========================================
-- 1. DATABASE & TABLE CREATION
-- ==========================================

-- Create Tables (Drop if exists to ensure fresh start)
DROP TABLE IF EXISTS product_certifications;
DROP TABLE IF EXISTS product_minerals;
DROP TABLE IF EXISTS certifications;
DROP TABLE IF EXISTS minerals;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS sources;
DROP TABLE IF EXISTS brands;

-- Table: Brands
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT, -- Use SERIAL for PostgreSQL
    brand_name VARCHAR(100) NOT NULL,
    parent_company VARCHAR(100), -- e.g., Danone, Coca-Cola
    website_url VARCHAR(255)
);

-- Table: Sources (Locations & Factories)
CREATE TABLE sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    source_name VARCHAR(100), -- e.g., Taiping Underground Water
    type VARCHAR(50), -- e.g., Underground, Spring, Municipal Tap
    location_address TEXT,
    state_province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Malaysia',
    kkm_approval_number VARCHAR(50) -- Unique MOH approval code
);

-- Table: Products
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT,
    source_id INT,
    product_name VARCHAR(150),
    product_type VARCHAR(50), -- 'Natural Mineral Water', 'Drinking Water', 'Distilled'
    treatment_process VARCHAR(100), -- e.g., 'Reverse Osmosis', 'Distillation', 'Filtration & UV'
    volume_ml INT, -- Stored as integer (e.g., 500, 1500)
    barcode VARCHAR(20),
    ph_level DECIMAL(4, 2),
    tds DECIMAL(6, 2), -- Total Dissolved Solids
    is_halal BOOLEAN DEFAULT TRUE,
    is_carbonated BOOLEAN DEFAULT FALSE,
    bottle_material VARCHAR(50) DEFAULT 'PET',
    manufacturer_name VARCHAR(150), -- Specific manufacturer for this SKU
    distributor_name VARCHAR(150),
    image_url VARCHAR(255), -- Path to image file or URL
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

-- Table: Minerals (Master List)
CREATE TABLE minerals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mineral_name VARCHAR(50),
    chemical_symbol VARCHAR(20),
    unit VARCHAR(10) DEFAULT 'mg/L'
);

-- Table: Product Composition (Junction Table for Minerals)
CREATE TABLE product_minerals (
    product_id INT,
    mineral_id INT,
    amount DECIMAL(8, 4), -- High precision for trace minerals
    PRIMARY KEY (product_id, mineral_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (mineral_id) REFERENCES minerals(id)
);

-- Table: Certifications (Master List)
CREATE TABLE certifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cert_name VARCHAR(100), -- e.g., 'Halal', 'HACCP', 'MeSTI'
    issuing_body VARCHAR(100) -- e.g., 'JAKIM', 'MOH'
);

-- Table: Product Certifications (Junction Table)
CREATE TABLE product_certifications (
    product_id INT,
    certification_id INT,
    reference_number VARCHAR(100),
    PRIMARY KEY (product_id, certification_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (certification_id) REFERENCES certifications(id)
);

-- ==========================================
-- 2. DATA SEEDING (Insert statements)
-- ==========================================

-- ----------------------------
-- A. Insert Minerals
-- ----------------------------
INSERT INTO minerals (id, mineral_name, chemical_symbol) VALUES
(1, 'Silica', 'SiO2'),
(2, 'Bicarbonate', 'HCO3'),
(3, 'Calcium', 'Ca'),
(4, 'Sodium', 'Na'),
(5, 'Sulphate', 'SO4'),
(6, 'Magnesium', 'Mg'),
(7, 'Potassium', 'K'),
(8, 'Chloride', 'Cl'),
(9, 'Fluoride', 'F'),
(10, 'Nitrate', 'NO3');

-- ----------------------------
-- B. Insert Certifications
-- ----------------------------
INSERT INTO certifications (id, cert_name, issuing_body) VALUES
(1, 'Halal', 'JAKIM/Foreign Islamic Body'),
(2, 'HACCP', 'MOH/Global'),
(3, 'MeSTI', 'MOH Malaysia'),
(4, 'Healthier Choice', 'MOH Malaysia'),
(5, 'GMP', 'MOH/Global');

-- ----------------------------
-- C. Insert Brands
-- ----------------------------
INSERT INTO brands (id, brand_name, parent_company) VALUES
(1, 'Spritzer', 'Spritzer Group'),
(2, 'ASK', 'OPM United'),
(3, 'Dasani', 'The Coca-Cola Company'),
(4, 'Cactus', 'Spritzer Group'),
(5, 'Ice Mountain', 'F&N'),
(6, 'DESA', 'Desa Mineral Water'),
(7, 'Le Minerale', 'Mayora Group'),
(8, 'Bubbles O2', 'Bubbles O2 Marketing'),
(9, 'Borneo Springs', 'Borneo Springs Sdn Bhd'),
(10, 'Summer', 'Chuan Sin Sdn Bhd'),
(11, 'TOPVALU', 'AEON'),
(12, 'MOMA', 'MOMA Water'),
(13, 'Volvic', 'Danone'),
(14, 'evian', 'Danone');

-- ----------------------------
-- D. Insert Sources
-- ----------------------------
INSERT INTO sources (id, source_name, type, location_address, state_province, country, kkm_approval_number) VALUES
(1, 'Taiping Underground Water', 'Underground', 'Lot 1466, Jalan Reservoir', 'Perak', 'Malaysia', 'KKM 163 (24/A/8)'),
(2, 'Rembau Underground Water', 'Underground', 'Lot 1390, Kg. Chenong', 'Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/5)'),
(3, 'Lenggeng Source', 'Underground', 'Lot 5043, Kg. Sompo', 'Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/1)'),
(4, 'Bukit Jintan', 'Underground', 'PTD 6386, Bukit Jintan', 'Johor', 'Malaysia', 'KKM 163 (24/J/6)'),
(5, 'Pasuruan Source', 'Underground', 'Jl. Raya Pasuruan-Malang Km 10', 'East Java', 'Indonesia', 'KKM 163 24/B/62'),
(6, 'Kanchong Aquifer', 'Underground (Oxygenated)', 'Kompleks Al Ammar, Kg. Kanchong', 'Negeri Sembilan', 'Malaysia', 'KKM 163 (24/N/10)'),
(7, 'Karak Source', 'Underground', 'Lot 7399, Jalan Mempaga', 'Pahang', 'Malaysia', 'KKM 163 (24/C/3)'),
(8, 'Taiping Distillation Plant', 'Municipal/Treated', 'Lot 898, Jalan Reservoir', 'Perak', 'Malaysia', 'KKM 163 (52/A/1)'),
(9, 'Shah Alam Plant', 'Municipal/Treated', 'Jalan Sitar 33/6', 'Selangor', 'Malaysia', NULL),
(10, 'Ulu Tiram Plant', 'Municipal/Treated', 'Jalan Makmur', 'Johor', 'Malaysia', 'KKM 163 (52/J/41)'),
(11, 'Sibu Plant', 'Municipal/Treated', 'Lot 96, Upper Lanang', 'Sarawak', 'Malaysia', 'KKM 163 (52/Q/28)'),
(12, 'Clairvic Spring', 'Spring', 'Volvic (Puy de Dôme)', 'Auvergne', 'France', 'KKM 163 (24/B/42)'),
(13, 'Cachat Spring', 'Spring', 'Evian-les-Bains', 'Haute-Savoie', 'France', 'KKM 163 (24/B/3)');

-- ----------------------------
-- E. Insert Products
-- ----------------------------
INSERT INTO products (id, brand_id, source_id, product_name, product_type, treatment_process, volume_ml, barcode, ph_level, tds, manufacturer_name, image_url) VALUES
-- 1. Spritzer Mineral
(1, 1, 1, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration', 550, '9556145116058', 7.65, 160.0, 'Chuan Sin Sdn. Bhd.', 'images/spritzer_mineral_550.jpg'),
-- 2. ASK
(2, 2, 2, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration', 500, '9555524003897', 7.30, 140.0, 'OPM United (M) Sdn Bhd', 'images/ask_500.jpg'),
-- 3. Dasani
(3, 3, 3, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration & UV', 600, '9556537002693', 7.10, 194.0, 'Vitaton (M) Sdn Bhd', 'images/dasani_600.jpg'),
-- 4. Cactus
(4, 4, 4, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration', 500, '9556135015002', 7.00, 136.0, 'Angenet Sdn. Bhd.', 'images/cactus_500.jpg'),
-- 5. Ice Mountain
(5, 5, 2, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration', 600, '9556570316856', 7.30, 120.0, 'Borneo Springs Sdn Bhd', 'images/icemountain_600.jpg'),
-- 6. DESA
(6, 6, 4, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration', 1500, '9556135181509', 7.00, 136.0, 'Desa Mineral Water (M) Sdn. Bhd.', 'images/desa_1500.jpg'),
-- 7. Le Minerale
(7, 7, 5, 'Natural Mineral Water', 'Natural Mineral Water', 'Mineral Protection System', 600, '8996001600269', 7.30, 132.0, 'PT Tirta Fresindo Jaya', 'images/leminerale_600.jpg'),
-- 8. Bubbles O2
(8, 8, 6, 'Naturally Oxygenated Mineral Water', 'Natural Mineral Water', 'Filtration', 425, '9555978700267', 7.20, 152.0, 'Sciensterra Sdn. Bhd.', 'images/bubbleso2_425.jpg'),
-- 9. Borneo Springs
(9, 9, 7, 'Natural Mineral Water', 'Natural Mineral Water', 'Filtration', 500, '9556570316856', 7.40, 106.0, 'Borneo Springs Sdn. Bhd.', 'images/borneosprings_500.jpg'),
-- 10. Spritzer Drinking (Distilled)
(10, 1, 8, 'Drinking Water (Distilled)', 'Drinking Water', 'Distillation', 550, '9556145115051', 7.00, 0.0, 'Chuan Sin Sdn. Bhd.', 'images/spritzer_distilled.jpg'),
-- 11. Summer (RO)
(11, 10, 9, 'Drinking Water (RO)', 'Drinking Water', 'Reverse Osmosis', 500, NULL, NULL, 0.0, 'Chuan Sin Sdn. Bhd.', 'images/summer_ro.jpg'),
-- 12. TOPVALU
(12, 11, 10, 'Drinking Water', 'Drinking Water', 'Filtration', 500, '9555819901228', NULL, NULL, 'Water Revelation Sdn. Bhd.', 'images/topvalu_500.jpg'),
-- 13. MOMA
(13, 12, 11, 'Drinking Water (RO)', 'Drinking Water', 'Reverse Osmosis', 500, NULL, NULL, NULL, 'MOMAWATER SDN. BHD.', 'images/moma_500.jpg'),
-- 14. Volvic
(14, 13, 12, 'Natural Mineral Water', 'Natural Mineral Water', 'Volcanic Filtration', 1500, '3057640100178', 7.00, NULL, 'Danone Group', 'images/volvic_1500.jpg'),
-- 15. Evian
(15, 14, 13, 'Natural Mineral Water', 'Natural Mineral Water', 'Glacial Filtration', 1250, '3068320063003', 7.20, 345.0, 'S.A.E.M.E', 'images/evian_1250.jpg');

-- ----------------------------
-- F. Insert Product Minerals
-- ----------------------------
-- 1. Spritzer Mineral
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(1, 1, 60.0), (1, 2, 104.0), (1, 3, 31.0), (1, 4, 9.9), (1, 5, 4.9), (1, 6, 2.7), (1, 7, 2.4);

-- 2. ASK
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(2, 3, 17.41), (2, 4, 36.38), (2, 7, 2.84), (2, 6, 0.58);

-- 3. Dasani
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(3, 2, 184.0), (3, 3, 37.1), (3, 6, 13.7), (3, 5, 8.2), (3, 8, 5.5), (3, 4, 4.4), (3, 7, 0.5);

-- 4. Cactus & 6. DESA (Share same source/composition)
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(4, 2, 59.0), (4, 5, 29.8), (4, 3, 21.7), (4, 4, 12.2), (4, 6, 5.7), (4, 8, 5.7), (4, 7, 1.7),
(6, 2, 59.0), (6, 5, 29.8), (6, 3, 21.7), (6, 4, 12.2), (6, 6, 5.7), (6, 8, 5.7), (6, 7, 1.7);

-- 5. Ice Mountain
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(5, 3, 21.09), (5, 4, 19.81), (5, 7, 3.40), (5, 8, 1.5), (5, 6, 0.91), (5, 2, 99.45);

-- 7. Le Minerale
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(7, 4, 48.5), (7, 2, 120.0), (7, 6, 5.5), (7, 3, 2.2), (7, 8, 2.7), (7, 7, 1.5);

-- 8. Bubbles O2
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(8, 2, 140.0), (8, 3, 27.1), (8, 4, 8.0), (8, 6, 6.8), (8, 7, 0.4), (8, 9, 0.2);

-- 9. Borneo Springs
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(9, 3, 21.6), (9, 4, 22.1), (9, 8, 1.3), (9, 6, 1.0), (9, 7, 0.5);

-- 15. Evian
INSERT INTO product_minerals (product_id, mineral_id, amount) VALUES
(15, 2, 360.0), (15, 3, 80.0), (15, 6, 26.0), (15, 1, 15.0), (15, 5, 14.0), (15, 8, 10.0), (15, 4, 6.5), (15, 10, 3.8), (15, 7, 1.0), (15, 9, 0.06);

-- ----------------------------
-- G. Insert Product Certifications (Examples)
-- ----------------------------
-- Spritzer (Halal)
INSERT INTO product_certifications VALUES (1, 1, 'JAKIM 1023-03/2004');
-- Dasani (Halal)
INSERT INTO product_certifications VALUES (3, 1, 'MS 1500 1025-09/2010');
-- Bubbles O2 (MeSTI)
INSERT INTO product_certifications VALUES (8, 3, NULL);
-- Le Minerale (Healthier Choice)
INSERT INTO product_certifications VALUES (7, 4, NULL);