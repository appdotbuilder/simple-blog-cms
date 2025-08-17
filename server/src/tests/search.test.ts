import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable, pagesTable } from '../db/schema';
import { type SearchInput } from '../schema';
import { searchContent, searchPosts, searchPages } from '../handlers/search';

// Test data
const testPost1 = {
  title: 'JavaScript Best Practices',
  slug: 'javascript-best-practices',
  content: 'Learn about modern JavaScript development patterns and techniques.',
  excerpt: 'A comprehensive guide to JavaScript',
  status: 'published' as const,
  published_at: new Date(),
  seo_title: 'Ultimate JavaScript Guide',
  seo_description: 'Complete JavaScript tutorial for developers',
  seo_keywords: 'javascript, programming, web development'
};

const testPost2 = {
  title: 'Python Data Science',
  slug: 'python-data-science',
  content: 'Explore data analysis with Python libraries like pandas and numpy.',
  excerpt: 'Data science with Python',
  status: 'published' as const,
  published_at: new Date(),
  seo_title: 'Python Data Analysis',
  seo_description: 'Learn data science with Python',
  seo_keywords: 'python, data science, analytics'
};

const testPost3 = {
  title: 'Draft Article',
  slug: 'draft-article',
  content: 'This contains JavaScript but is not published.',
  excerpt: 'Draft content',
  status: 'draft' as const,
  published_at: null
};

const testPage1 = {
  title: 'About Us',
  slug: 'about-us',
  content: 'We are a technology company focused on JavaScript and web development.',
  status: 'published' as const,
  published_at: new Date(),
  seo_title: 'About Our Company',
  seo_description: 'Learn about our mission and values',
  seo_keywords: 'company, mission, technology'
};

const testPage2 = {
  title: 'Contact Information',
  slug: 'contact',
  content: 'Get in touch with our team for support and inquiries.',
  status: 'published' as const,
  published_at: new Date(),
  seo_title: 'Contact Us',
  seo_description: 'Contact our support team',
  seo_keywords: 'contact, support, help'
};

const testPage3 = {
  title: 'Private Page',
  slug: 'private-page',
  content: 'This page contains JavaScript information but is not published.',
  status: 'draft' as const,
  published_at: null
};

describe('searchContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should search across both posts and pages', async () => {
    // Create test data
    await db.insert(postsTable).values([testPost1, testPost2, testPost3]).execute();
    await db.insert(pagesTable).values([testPage1, testPage2, testPage3]).execute();

    const searchInput: SearchInput = {
      query: 'JavaScript',
      type: 'all'
    };

    const result = await searchContent(searchInput);

    // Should find 1 post and 1 page (both published and containing 'JavaScript')
    expect(result.posts).toHaveLength(1);
    expect(result.pages).toHaveLength(1);
    expect(result.total).toBe(2);

    // Verify the correct items were found
    expect(result.posts[0].title).toBe('JavaScript Best Practices');
    expect(result.pages[0].title).toBe('About Us');
  });

  it('should return empty results for non-matching query', async () => {
    await db.insert(postsTable).values([testPost1]).execute();
    await db.insert(pagesTable).values([testPage1]).execute();

    const searchInput: SearchInput = {
      query: 'NonExistentTerm',
      type: 'all'
    };

    const result = await searchContent(searchInput);

    expect(result.posts).toHaveLength(0);
    expect(result.pages).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should only return published content', async () => {
    await db.insert(postsTable).values([testPost1, testPost3]).execute();
    await db.insert(pagesTable).values([testPage1, testPage3]).execute();

    const searchInput: SearchInput = {
      query: 'JavaScript',
      type: 'all'
    };

    const result = await searchContent(searchInput);

    // Should only find published content
    expect(result.posts).toHaveLength(1);
    expect(result.pages).toHaveLength(1);
    expect(result.posts[0].status).toBe('published');
    expect(result.pages[0].status).toBe('published');
  });
});

describe('searchPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should search in post title', async () => {
    await db.insert(postsTable).values([testPost1, testPost2]).execute();

    const searchInput: SearchInput = {
      query: 'JavaScript',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('JavaScript Best Practices');
  });

  it('should search in post content', async () => {
    await db.insert(postsTable).values([testPost1, testPost2]).execute();

    const searchInput: SearchInput = {
      query: 'pandas',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Python Data Science');
  });

  it('should search in post excerpt', async () => {
    await db.insert(postsTable).values([testPost1, testPost2]).execute();

    const searchInput: SearchInput = {
      query: 'comprehensive guide',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('JavaScript Best Practices');
  });

  it('should search in SEO fields', async () => {
    await db.insert(postsTable).values([testPost1, testPost2]).execute();

    const searchInput: SearchInput = {
      query: 'Ultimate',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('JavaScript Best Practices');
  });

  it('should search in SEO keywords', async () => {
    await db.insert(postsTable).values([testPost1, testPost2]).execute();

    const searchInput: SearchInput = {
      query: 'analytics',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Python Data Science');
  });

  it('should only return published posts', async () => {
    await db.insert(postsTable).values([testPost1, testPost3]).execute();

    const searchInput: SearchInput = {
      query: 'JavaScript',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('published');
    expect(result[0].title).toBe('JavaScript Best Practices');
  });

  it('should be case insensitive', async () => {
    await db.insert(postsTable).values([testPost1]).execute();

    const searchInput: SearchInput = {
      query: 'javascript',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('JavaScript Best Practices');
  });

  it('should handle partial matches', async () => {
    await db.insert(postsTable).values([testPost1]).execute();

    const searchInput: SearchInput = {
      query: 'Java',
      type: 'posts'
    };

    const result = await searchPosts(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('JavaScript Best Practices');
  });
});

describe('searchPages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should search in page title', async () => {
    await db.insert(pagesTable).values([testPage1, testPage2]).execute();

    const searchInput: SearchInput = {
      query: 'About',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('About Us');
  });

  it('should search in page content', async () => {
    await db.insert(pagesTable).values([testPage1, testPage2]).execute();

    const searchInput: SearchInput = {
      query: 'technology company',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('About Us');
  });

  it('should search in SEO fields', async () => {
    await db.insert(pagesTable).values([testPage1, testPage2]).execute();

    const searchInput: SearchInput = {
      query: 'mission',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('About Us');
  });

  it('should only return published pages', async () => {
    await db.insert(pagesTable).values([testPage1, testPage3]).execute();

    const searchInput: SearchInput = {
      query: 'JavaScript',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('published');
    expect(result[0].title).toBe('About Us');
  });

  it('should be case insensitive', async () => {
    await db.insert(pagesTable).values([testPage2]).execute();

    const searchInput: SearchInput = {
      query: 'CONTACT',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Contact Information');
  });

  it('should handle empty search results', async () => {
    await db.insert(pagesTable).values([testPage1]).execute();

    const searchInput: SearchInput = {
      query: 'NonExistentTerm',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(0);
  });

  it('should search across multiple SEO fields', async () => {
    await db.insert(pagesTable).values([testPage1, testPage2]).execute();

    // Search for a term that appears in SEO keywords
    const searchInput: SearchInput = {
      query: 'support',
      type: 'pages'
    };

    const result = await searchPages(searchInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Contact Information');
  });
});