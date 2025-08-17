import { z } from 'zod';

// User schema (admin user)
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  is_admin: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Login input schema
export const loginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Content status enum
export const contentStatusSchema = z.enum(['draft', 'scheduled', 'published', 'unpublished']);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

// SEO metadata schema
export const seoMetadataSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  keywords: z.string().nullable()
});

export type SeoMetadata = z.infer<typeof seoMetadataSchema>;

// Open Graph metadata schema
export const ogMetadataSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  type: z.string().nullable(),
  url: z.string().url().nullable()
});

export type OgMetadata = z.infer<typeof ogMetadataSchema>;

// Post schema
export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  status: contentStatusSchema,
  published_at: z.coerce.date().nullable(),
  scheduled_at: z.coerce.date().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  seo_keywords: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
  og_image_url: z.string().nullable(),
  og_type: z.string().nullable(),
  og_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Post = z.infer<typeof postSchema>;

// Page schema
export const pageSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  status: contentStatusSchema,
  published_at: z.coerce.date().nullable(),
  scheduled_at: z.coerce.date().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  seo_keywords: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
  og_image_url: z.string().nullable(),
  og_type: z.string().nullable(),
  og_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Page = z.infer<typeof pageSchema>;

// Comment schema
export const commentSchema = z.object({
  id: z.number(),
  post_id: z.number(),
  author_name: z.string(),
  author_email: z.string().email(),
  content: z.string(),
  is_approved: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Comment = z.infer<typeof commentSchema>;

// Input schemas for creating posts
export const createPostInputSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  status: contentStatusSchema.default('draft'),
  scheduled_at: z.coerce.date().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  og_image_url: z.string().url().nullable().optional(),
  og_type: z.string().nullable().optional(),
  og_url: z.string().url().nullable().optional()
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

// Input schemas for updating posts
export const updatePostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  status: contentStatusSchema.optional(),
  scheduled_at: z.coerce.date().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  og_image_url: z.string().url().nullable().optional(),
  og_type: z.string().nullable().optional(),
  og_url: z.string().url().nullable().optional()
});

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

// Input schemas for creating pages
export const createPageInputSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  status: contentStatusSchema.default('draft'),
  scheduled_at: z.coerce.date().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  og_image_url: z.string().url().nullable().optional(),
  og_type: z.string().nullable().optional(),
  og_url: z.string().url().nullable().optional()
});

export type CreatePageInput = z.infer<typeof createPageInputSchema>;

// Input schemas for updating pages
export const updatePageInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  status: contentStatusSchema.optional(),
  scheduled_at: z.coerce.date().nullable().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
  og_title: z.string().nullable().optional(),
  og_description: z.string().nullable().optional(),
  og_image_url: z.string().url().nullable().optional(),
  og_type: z.string().nullable().optional(),
  og_url: z.string().url().nullable().optional()
});

export type UpdatePageInput = z.infer<typeof updatePageInputSchema>;

// Input schema for creating comments
export const createCommentInputSchema = z.object({
  post_id: z.number(),
  author_name: z.string().min(1),
  author_email: z.string().email(),
  content: z.string().min(1)
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

// Input schema for approving/disapproving comments
export const updateCommentStatusInputSchema = z.object({
  id: z.number(),
  is_approved: z.boolean()
});

export type UpdateCommentStatusInput = z.infer<typeof updateCommentStatusInputSchema>;

// Search input schema
export const searchInputSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['posts', 'pages', 'all']).default('all')
});

export type SearchInput = z.infer<typeof searchInputSchema>;

// Generic ID input schema
export const idInputSchema = z.object({
  id: z.number()
});

export type IdInput = z.infer<typeof idInputSchema>;

// Slug input schema
export const slugInputSchema = z.object({
  slug: z.string()
});

export type SlugInput = z.infer<typeof slugInputSchema>;