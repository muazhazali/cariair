// Drizzle ORM Schema Definitions
// These match the PostgreSQL schema in sql/schema.sql

import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, boolean } from 'drizzle-orm/pg-core';

// Users table (NextAuth compatible)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Accounts table (OAuth linking)
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  idToken: text('id_token'),
  sessionState: varchar('session_state', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Verification tokens table
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  primaryKey: [table.identifier, table.token],
}));

// Brands table
export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandName: varchar('brand_name', { length: 100 }).notNull(),
  parentCompany: varchar('parent_company', { length: 100 }),
  websiteUrl: varchar('website_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Manufacturers table
export const manufacturers = pgTable('manufacturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sources table (water sources)
export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceName: varchar('source_name', { length: 100 }),
  type: varchar('type', { length: 50 }),
  locationAddress: text('location_address'),
  lat: decimal('lat', { precision: 10, scale: 8 }),
  lng: decimal('lng', { precision: 11, scale: 8 }),
  kkmApprovalNumber: varchar('kkm_approval_number', { length: 50 }),
  country: varchar('country', { length: 100 }).default('Malaysia').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Images table (BYTEA storage)
export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  data: text('data').notNull(), // Store as base64 or use bytea
  sizeBytes: integer('size_bytes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').references(() => brands.id),
  manufacturerId: uuid('manufacturer_id').references(() => manufacturers.id),
  sourceId: uuid('source_id').references(() => sources.id),
  submittedBy: uuid('submitted_by').references(() => users.id),
  productName: varchar('product_name', { length: 150 }),
  barcode: varchar('barcode', { length: 50 }),
  phLevel: decimal('ph_level', { precision: 4, scale: 2 }),
  tds: decimal('tds', { precision: 6, scale: 2 }),
  mineralsJson: jsonb('minerals_json'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product images junction table
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageId: uuid('image_id').notNull().references(() => images.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
