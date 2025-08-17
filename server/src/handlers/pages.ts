import { db } from '../db';
import { pagesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type CreatePageInput, type UpdatePageInput, type Page, type IdInput, type SlugInput } from '../schema';

// Helper function to generate a slug from title
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty after processing, generate a fallback
  return slug || 'page';
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    try {
      // Try to create the page with this slug first to handle race conditions
      const existingPage = await db.select()
        .from(pagesTable)
        .where(eq(pagesTable.slug, slug))
        .limit(1)
        .execute();
        
      if (existingPage.length === 0) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    } catch (error) {
      // If there's an error checking, increment and try again
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loops
      if (counter > 100) {
        throw new Error('Could not generate unique slug after 100 attempts');
      }
    }
  }
}

export async function createPage(input: CreatePageInput): Promise<Page> {
  try {
    // Generate unique slug from title
    const baseSlug = generateSlug(input.title);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    // Set published_at if status is published
    const publishedAt = input.status === 'published' ? new Date() : null;

    // Insert page record
    const result = await db.insert(pagesTable)
      .values({
        title: input.title,
        slug: uniqueSlug,
        content: input.content,
        status: input.status,
        published_at: publishedAt,
        scheduled_at: input.scheduled_at || null,
        seo_title: input.seo_title || null,
        seo_description: input.seo_description || null,
        seo_keywords: input.seo_keywords || null,
        og_title: input.og_title || null,
        og_description: input.og_description || null,
        og_image_url: input.og_image_url || null,
        og_type: input.og_type || null,
        og_url: input.og_url || null,
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Page creation failed:', error);
    throw error;
  }
}

export async function updatePage(input: UpdatePageInput): Promise<Page> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to update an existing page.
    // It should handle partial updates and regenerate slug if title changes.
    return Promise.resolve({
        id: input.id,
        title: 'Updated Page Title',
        slug: 'updated-page-slug',
        content: 'Updated page content',
        status: 'draft',
        published_at: null,
        scheduled_at: null,
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
        og_title: null,
        og_description: null,
        og_image_url: null,
        og_type: null,
        og_url: null,
        created_at: new Date(),
        updated_at: new Date()
    });
}

export async function deletePage(input: IdInput): Promise<{ success: boolean }> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to delete a page from the database.
    return Promise.resolve({ success: true });
}

export async function getPage(input: SlugInput): Promise<Page | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a single page by its slug for public viewing.
    // It should only return published pages for non-admin users.
    return Promise.resolve(null);
}

export async function getPageById(input: IdInput): Promise<Page | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a single page by ID for admin editing.
    return Promise.resolve(null);
}

export async function getAllPages(): Promise<Page[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all pages for admin management.
    // It should return pages in all statuses for admin users.
    return Promise.resolve([]);
}

export async function getPublishedPages(): Promise<Page[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch only published pages for public viewing.
    // It should return pages ordered by title or created_at.
    return Promise.resolve([]);
}

export async function publishPage(input: IdInput): Promise<Page> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to publish a page by setting status and published_at.
    return Promise.resolve({
        id: input.id,
        title: 'Published Page',
        slug: 'published-page',
        content: 'Content',
        status: 'published',
        published_at: new Date(),
        scheduled_at: null,
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
        og_title: null,
        og_description: null,
        og_image_url: null,
        og_type: null,
        og_url: null,
        created_at: new Date(),
        updated_at: new Date()
    });
}

export async function unpublishPage(input: IdInput): Promise<Page> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to unpublish a page by changing its status.
    return Promise.resolve({
        id: input.id,
        title: 'Unpublished Page',
        slug: 'unpublished-page',
        content: 'Content',
        status: 'unpublished',
        published_at: null,
        scheduled_at: null,
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
        og_title: null,
        og_description: null,
        og_image_url: null,
        og_type: null,
        og_url: null,
        created_at: new Date(),
        updated_at: new Date()
    });
}