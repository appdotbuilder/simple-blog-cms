import { db } from '../db';
import { postsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type CreatePostInput, type UpdatePostInput, type Post, type IdInput, type SlugInput } from '../schema';

// Helper function to generate a URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to ensure slug uniqueness
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existingPost = await db.select()
      .from(postsTable)
      .where(eq(postsTable.slug, slug))
      .limit(1)
      .execute();
    
    if (existingPost.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  try {
    // Generate unique slug from title
    const baseSlug = generateSlug(input.title);
    const uniqueSlug = await generateUniqueSlug(baseSlug);
    
    // Set published_at if status is published
    const publishedAt = input.status === 'published' ? new Date() : null;
    
    // Insert post record
    const result = await db.insert(postsTable)
      .values({
        title: input.title,
        slug: uniqueSlug,
        content: input.content,
        excerpt: input.excerpt || null,
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
        og_url: input.og_url || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Post creation failed:', error);
    throw error;
  }
}

export async function updatePost(input: UpdatePostInput): Promise<Post> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to update an existing blog post.
    // It should handle partial updates and regenerate slug if title changes.
    return Promise.resolve({
        id: input.id,
        title: 'Updated Title',
        slug: 'updated-slug',
        content: 'Updated content',
        excerpt: null,
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

export async function deletePost(input: IdInput): Promise<{ success: boolean }> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to delete a blog post and all its comments.
    return Promise.resolve({ success: true });
}

export async function getPost(input: SlugInput): Promise<Post | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a single post by its slug for public viewing.
    // It should only return published posts for non-admin users.
    return Promise.resolve(null);
}

export async function getPostById(input: IdInput): Promise<Post | null> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch a single post by ID for admin editing.
    return Promise.resolve(null);
}

export async function getAllPosts(): Promise<Post[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch all posts for admin management.
    // It should return posts in all statuses for admin users.
    return Promise.resolve([]);
}

export async function getPublishedPosts(): Promise<Post[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to fetch only published posts for public viewing.
    // It should return posts ordered by published_at date descending.
    return Promise.resolve([]);
}

export async function publishPost(input: IdInput): Promise<Post> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to publish a post by setting status and published_at.
    return Promise.resolve({
        id: input.id,
        title: 'Published Post',
        slug: 'published-post',
        content: 'Content',
        excerpt: null,
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

export async function unpublishPost(input: IdInput): Promise<Post> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is to unpublish a post by changing its status.
    return Promise.resolve({
        id: input.id,
        title: 'Unpublished Post',
        slug: 'unpublished-post',
        content: 'Content',
        excerpt: null,
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