import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput } from '../schema';
import { createPage } from '../handlers/pages';
import { eq } from 'drizzle-orm';

// Test input with all required fields and some optional ones
const testInput: CreatePageInput = {
  title: 'Test Page',
  content: 'This is test page content with <strong>HTML</strong> formatting.',
  status: 'draft',
  scheduled_at: null,
  seo_title: 'Test Page SEO Title',
  seo_description: 'This is a test page for SEO purposes',
  seo_keywords: 'test, page, seo',
  og_title: 'Test Page OG Title',
  og_description: 'Test page for Open Graph',
  og_image_url: 'https://example.com/test-image.jpg',
  og_type: 'article',
  og_url: 'https://example.com/test-page'
};

describe('createPage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a page with all fields', async () => {
    const result = await createPage(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Page');
    expect(result.content).toEqual(testInput.content);
    expect(result.status).toEqual('draft');
    expect(result.slug).toEqual('test-page');
    expect(result.published_at).toBeNull();
    expect(result.scheduled_at).toBeNull();
    
    // SEO metadata validation
    expect(result.seo_title).toEqual('Test Page SEO Title');
    expect(result.seo_description).toEqual('This is a test page for SEO purposes');
    expect(result.seo_keywords).toEqual('test, page, seo');
    
    // Open Graph metadata validation
    expect(result.og_title).toEqual('Test Page OG Title');
    expect(result.og_description).toEqual('Test page for Open Graph');
    expect(result.og_image_url).toEqual('https://example.com/test-image.jpg');
    expect(result.og_type).toEqual('article');
    expect(result.og_url).toEqual('https://example.com/test-page');
    
    // Auto-generated fields
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save page to database', async () => {
    const result = await createPage(testInput);

    // Query database to verify page was saved
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].title).toEqual('Test Page');
    expect(pages[0].slug).toEqual('test-page');
    expect(pages[0].content).toEqual(testInput.content);
    expect(pages[0].status).toEqual('draft');
    expect(pages[0].seo_title).toEqual('Test Page SEO Title');
    expect(pages[0].og_image_url).toEqual('https://example.com/test-image.jpg');
    expect(pages[0].created_at).toBeInstanceOf(Date);
  });

  it('should generate slug from title', async () => {
    const input: CreatePageInput = {
      title: 'My Awesome Page Title!',
      content: 'Content here',
      status: 'draft',
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

    const result = await createPage(input);
    expect(result.slug).toEqual('my-awesome-page-title');
  });

  it('should handle special characters in slug generation', async () => {
    const input: CreatePageInput = {
      title: 'Page with Special Characters: @#$% & More!',
      content: 'Content here',
      status: 'draft',
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

    const result = await createPage(input);
    expect(result.slug).toEqual('page-with-special-characters-more');
  });

  it('should ensure unique slugs when duplicates exist', async () => {
    const input1: CreatePageInput = {
      title: 'Duplicate Page Title',
      content: 'First page content',
      status: 'draft',
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

    const input2: CreatePageInput = {
      title: 'Duplicate Page Title',
      content: 'Second page content',
      status: 'draft',
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

    const result1 = await createPage(input1);
    const result2 = await createPage(input2);

    expect(result1.slug).toEqual('duplicate-page-title');
    expect(result2.slug).toEqual('duplicate-page-title-1');
    expect(result1.id).not.toEqual(result2.id);
  });

  it('should set published_at when status is published', async () => {
    const input: CreatePageInput = {
      title: 'Published Page',
      content: 'This page is published',
      status: 'published',
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

    const result = await createPage(input);
    
    expect(result.status).toEqual('published');
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at!.getTime()).toBeCloseTo(new Date().getTime(), -2); // Within 100ms
  });

  it('should handle scheduled pages with scheduled_at', async () => {
    const scheduledDate = new Date('2024-12-31T10:00:00Z');
    const input: CreatePageInput = {
      title: 'Scheduled Page',
      content: 'This page is scheduled',
      status: 'scheduled',
      scheduled_at: scheduledDate,
      seo_title: null,
      seo_description: null,
      seo_keywords: null,
      og_title: null,
      og_description: null,
      og_image_url: null,
      og_type: null,
      og_url: null
    };

    const result = await createPage(input);
    
    expect(result.status).toEqual('scheduled');
    expect(result.scheduled_at).toBeInstanceOf(Date);
    expect(result.scheduled_at!.getTime()).toEqual(scheduledDate.getTime());
    expect(result.published_at).toBeNull();
  });

  it('should create page with minimal required fields only', async () => {
    const minimalInput: CreatePageInput = {
      title: 'Minimal Page',
      content: 'Just the basics',
      status: 'draft', // This is a Zod default, but we include it for clarity
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

    const result = await createPage(minimalInput);
    
    expect(result.title).toEqual('Minimal Page');
    expect(result.content).toEqual('Just the basics');
    expect(result.status).toEqual('draft');
    expect(result.slug).toEqual('minimal-page');
    
    // All optional fields should be null
    expect(result.seo_title).toBeNull();
    expect(result.seo_description).toBeNull();
    expect(result.seo_keywords).toBeNull();
    expect(result.og_title).toBeNull();
    expect(result.og_description).toBeNull();
    expect(result.og_image_url).toBeNull();
    expect(result.og_type).toBeNull();
    expect(result.og_url).toBeNull();
    expect(result.scheduled_at).toBeNull();
    expect(result.published_at).toBeNull();
  });

  it('should handle empty title gracefully for slug generation', async () => {
    const input: CreatePageInput = {
      title: '   ',
      content: 'Content with empty title',
      status: 'draft',
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

    const result = await createPage(input);
    
    // Should create fallback slug for empty/whitespace title
    expect(result.slug).toEqual('page');
    expect(result.title).toEqual('   '); // Original title should be preserved
  });

  it('should handle multiple sequential unique slug generation', async () => {
    const baseInput: CreatePageInput = {
      title: 'Test Page',
      content: 'Content',
      status: 'draft',
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

    // Create 3 pages with same title sequentially to avoid race conditions
    const result1 = await createPage(baseInput);
    const result2 = await createPage(baseInput);
    const result3 = await createPage(baseInput);

    expect(result1.slug).toEqual('test-page');
    expect(result2.slug).toEqual('test-page-1');
    expect(result3.slug).toEqual('test-page-2');

    // Verify all are saved in database
    const allPages = await db.select().from(pagesTable).execute();
    expect(allPages).toHaveLength(3);
  });
});