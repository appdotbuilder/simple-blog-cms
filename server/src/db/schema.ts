import { serial, text, pgTable, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Content status enum
export const contentStatusEnum = pgEnum('content_status', ['draft', 'scheduled', 'published', 'unpublished']);

// Users table (for admin authentication)
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  is_admin: boolean('is_admin').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Posts table
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'), // Nullable by default
  status: contentStatusEnum('status').notNull().default('draft'),
  published_at: timestamp('published_at'), // Nullable
  scheduled_at: timestamp('scheduled_at'), // Nullable
  // SEO metadata
  seo_title: text('seo_title'), // Nullable
  seo_description: text('seo_description'), // Nullable
  seo_keywords: text('seo_keywords'), // Nullable
  // Open Graph metadata
  og_title: text('og_title'), // Nullable
  og_description: text('og_description'), // Nullable
  og_image_url: text('og_image_url'), // Nullable
  og_type: text('og_type'), // Nullable
  og_url: text('og_url'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Pages table
export const pagesTable = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  status: contentStatusEnum('status').notNull().default('draft'),
  published_at: timestamp('published_at'), // Nullable
  scheduled_at: timestamp('scheduled_at'), // Nullable
  // SEO metadata
  seo_title: text('seo_title'), // Nullable
  seo_description: text('seo_description'), // Nullable
  seo_keywords: text('seo_keywords'), // Nullable
  // Open Graph metadata
  og_title: text('og_title'), // Nullable
  og_description: text('og_description'), // Nullable
  og_image_url: text('og_image_url'), // Nullable
  og_type: text('og_type'), // Nullable
  og_url: text('og_url'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Comments table
export const commentsTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  post_id: serial('post_id').notNull(),
  author_name: text('author_name').notNull(),
  author_email: text('author_email').notNull(),
  content: text('content').notNull(),
  is_approved: boolean('is_approved').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const postsRelations = relations(postsTable, ({ many }) => ({
  comments: many(commentsTable),
}));

export const commentsRelations = relations(commentsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [commentsTable.post_id],
    references: [postsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect; // For SELECT operations
export type NewUser = typeof usersTable.$inferInsert; // For INSERT operations

export type Post = typeof postsTable.$inferSelect; // For SELECT operations
export type NewPost = typeof postsTable.$inferInsert; // For INSERT operations

export type Page = typeof pagesTable.$inferSelect; // For SELECT operations
export type NewPage = typeof pagesTable.$inferInsert; // For INSERT operations

export type Comment = typeof commentsTable.$inferSelect; // For SELECT operations
export type NewComment = typeof commentsTable.$inferInsert; // For INSERT operations

// Export all tables and relations for proper query building
export const tables = { 
  users: usersTable,
  posts: postsTable,
  pages: pagesTable,
  comments: commentsTable
};