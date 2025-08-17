import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable } from '../db/schema';
import { type CreatePostInput } from '../schema';
import { createPost } from '../handlers/posts';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreatePostInput = {
  title: 'My First Blog Post',
  content: 'This is the content of my first blog post. It contains some interesting information.',
  excerpt: 'A brief excerpt of the post',
  status: 'draft',
  scheduled_at: null,
  seo_title: 'SEO Optimized Title',
  seo_description: 'SEO description for search engines',
  seo_keywords: 'blog, post, test, seo',
  og_title: 'OG Title for Social',
  og_description: 'Open Graph description',
  og_image_url: 'https://example.com/image.jpg',
  og_type: 'article',
  og_url: 'https://example.com/my-first-blog-post'
};

describe('createPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a post with all fields', async () => {
    const result = await createPost(testInput);

    // Verify all input fields are properly saved
    expect(result.title).toEqual('My First Blog Post');
    expect(result.content).toEqual(testInput.content);
    expect(result.excerpt).toEqual('A brief excerpt of the post');
    expect(result.status).toEqual('draft');
    expect(result.scheduled_at).toBeNull();
    expect(result.published_at).toBeNull(); // Should be null for draft
    expect(result.seo_title).toEqual('SEO Optimized Title');
    expect(result.seo_description).toEqual('SEO description for search engines');
    expect(result.seo_keywords).toEqual('blog, post, test, seo');
    expect(result.og_title).toEqual('OG Title for Social');
    expect(result.og_description).toEqual('Open Graph description');
    expect(result.og_image_url).toEqual('https://example.com/image.jpg');
    expect(result.og_type).toEqual('article');
    expect(result.og_url).toEqual('https://example.com/my-first-blog-post');

    // Verify generated fields
    expect(result.id).toBeDefined();
    expect(result.slug).toEqual('my-first-blog-post');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should generate correct slug from title', async () => {
    const input = {
      ...testInput,
      title: 'Hello World! This is a Test Post #1'
    };

    const result = await createPost(input);

    expect(result.slug).toEqual('hello-world-this-is-a-test-post-1');
  });

  it('should handle special characters in title', async () => {
    const input = {
      ...testInput,
      title: 'C++ Programming & JavaScript: Best Practices!'
    };

    const result = await createPost(input);

    expect(result.slug).toEqual('c-programming-javascript-best-practices');
  });

  it('should ensure slug uniqueness', async () => {
    const input1 = {
      ...testInput,
      title: 'Duplicate Title'
    };

    const input2 = {
      ...testInput,
      title: 'Duplicate Title'
    };

    const result1 = await createPost(input1);
    const result2 = await createPost(input2);

    expect(result1.slug).toEqual('duplicate-title');
    expect(result2.slug).toEqual('duplicate-title-1');
  });

  it('should handle multiple slug conflicts', async () => {
    const baseInput = {
      ...testInput,
      title: 'Popular Title'
    };

    // Create multiple posts with same title sequentially to avoid race conditions
    const result1 = await createPost(baseInput);
    const result2 = await createPost(baseInput);
    const result3 = await createPost(baseInput);

    expect(result1.slug).toEqual('popular-title');
    expect(result2.slug).toEqual('popular-title-1');
    expect(result3.slug).toEqual('popular-title-2');
  });

  it('should set published_at when status is published', async () => {
    const input = {
      ...testInput,
      status: 'published' as const
    };

    const result = await createPost(input);

    expect(result.status).toEqual('published');
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at!.getTime()).toBeCloseTo(Date.now(), -3); // Within 3 seconds
  });

  it('should handle scheduled posts', async () => {
    const scheduledDate = new Date('2024-12-25T10:00:00Z');
    const input = {
      ...testInput,
      status: 'scheduled' as const,
      scheduled_at: scheduledDate
    };

    const result = await createPost(input);

    expect(result.status).toEqual('scheduled');
    expect(result.scheduled_at).toEqual(scheduledDate);
    expect(result.published_at).toBeNull(); // Should not be published yet
  });

  it('should save post to database', async () => {
    const result = await createPost(testInput);

    // Query database directly to verify storage
    const posts = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, result.id))
      .execute();

    expect(posts).toHaveLength(1);
    const savedPost = posts[0];
    
    expect(savedPost.title).toEqual('My First Blog Post');
    expect(savedPost.slug).toEqual('my-first-blog-post');
    expect(savedPost.content).toEqual(testInput.content);
    expect(savedPost.status).toEqual('draft');
    expect(savedPost.seo_title).toEqual('SEO Optimized Title');
    expect(savedPost.og_image_url).toEqual('https://example.com/image.jpg');
    expect(savedPost.created_at).toBeInstanceOf(Date);
  });

  it('should handle minimal input with defaults', async () => {
    const minimalInput: CreatePostInput = {
      title: 'Minimal Post',
      content: 'Just basic content',
      excerpt: null,
      status: 'draft', // Default from schema
      scheduled_at: null,
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
      og_title: null,
      og_description: null,
      og_image_url: null,
      og_type: null,
      og_url: null
    };

    const result = await createPost(minimalInput);

    expect(result.title).toEqual('Minimal Post');
    expect(result.content).toEqual('Just basic content');
    expect(result.slug).toEqual('minimal-post');
    expect(result.status).toEqual('draft');
    expect(result.excerpt).toBeNull();
    expect(result.seo_title).toBeNull();
    expect(result.og_title).toBeNull();
  });

  it('should handle empty slug edge case', async () => {
    const input = {
      ...testInput,
      title: '!@#$%^&*()' // Only special characters
    };

    const result = await createPost(input);

    // Should generate some fallback slug (empty string becomes valid after processing)
    expect(result.slug).toBeDefined();
    expect(typeof result.slug).toBe('string');
  });

  it('should handle very long titles', async () => {
    const longTitle = 'A'.repeat(200) + ' Very Long Title That Should Be Handled Properly';
    const input = {
      ...testInput,
      title: longTitle
    };

    const result = await createPost(input);

    expect(result.title).toEqual(longTitle);
    expect(result.slug).toBeDefined();
    expect(result.slug.length).toBeGreaterThan(0);
    // Slug should be URL-friendly despite long title
    expect(result.slug).toMatch(/^[a-z0-9-]+$/);
  });
});