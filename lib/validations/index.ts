/**
 * API Input Validation Schemas
 * 
 * All API input validation using Zod schemas
 * for type-safe and validated API requests
 */

import { z } from 'zod';

// ==========================================
// Product Validations
// ==========================================

export const productIdSchema = z.string().uuid('Invalid product ID');

export const productStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const mineralCompositionSchema = z.record(
  z.string(),
  z.number().min(0, 'Mineral value must be non-negative')
);

export const createProductSchema = z.object({
  product_name: z.string().min(1, 'Product name is required').max(150),
  barcode: z.string().max(50).optional().nullable(),
  brand_id: z.string().uuid('Invalid brand ID').optional().nullable(),
  manufacturer_id: z.string().uuid('Invalid manufacturer ID').optional().nullable(),
  source_id: z.string().uuid('Invalid source ID').optional().nullable(),
  ph_level: z.number().min(0).max(14).optional().nullable(),
  tds: z.number().min(0).optional().nullable(),
  minerals_json: mineralCompositionSchema.optional().nullable(),
  status: productStatusSchema.default('pending'),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  q: z.string().optional(),
  types: z.array(z.string()).optional(),
  excludeTypes: z.array(z.string()).optional(),
  brands: z.array(z.string().uuid()).optional(),
  excludeBrands: z.array(z.string().uuid()).optional(),
  minPh: z.coerce.number().min(0).max(14).optional(),
  maxPh: z.coerce.number().min(0).max(14).optional(),
  minTds: z.coerce.number().min(0).optional(),
  maxTds: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// ==========================================
// Source Validations
// ==========================================

export const sourceIdSchema = z.string().uuid('Invalid source ID');

export const sourceTypeSchema = z.enum(['Underground', 'Spring', 'Municipal', 'Oxygenated']);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createSourceSchema = z.object({
  source_name: z.string().min(1, 'Source name is required').max(100),
  type: sourceTypeSchema.optional().nullable(),
  location_address: z.string().optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  kkm_approval_number: z.string().max(50).optional().nullable(),
  country: z.string().default('Malaysia'),
});

export const updateSourceSchema = createSourceSchema.partial();

export const sourceFiltersSchema = z.object({
  map: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
});

// ==========================================
// Brand Validations
// ==========================================

export const brandIdSchema = z.string().uuid('Invalid brand ID');

export const createBrandSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required').max(100),
  parent_company: z.string().max(100).optional().nullable(),
  website_url: z.string().url('Invalid URL').max(255).optional().nullable(),
});

export const updateBrandSchema = createBrandSchema.partial();

// ==========================================
// Manufacturer Validations
// ==========================================

export const manufacturerIdSchema = z.string().uuid('Invalid manufacturer ID');

export const createManufacturerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  address: z.string().optional().nullable(),
});

export const updateManufacturerSchema = createManufacturerSchema.partial();

// ==========================================
// User Validations
// ==========================================

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(255).optional(),
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ==========================================
// Image Validations
// ==========================================

export const imageIdSchema = z.string().uuid('Invalid image ID');

export const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ==========================================
// Export Validations
// ==========================================

export const exportFormatSchema = z.enum(['json', 'csv']);

// ==========================================
// Rate Limit Validations
// ==========================================

export const rateLimitActionSchema = z.enum([
  'login',
  'register',
  'api',
  'general',
]);

// ==========================================
// Type Exports
// ==========================================

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof updateManufacturerSchema>;

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
