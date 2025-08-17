import { db } from '../db';
import { postsTable, pagesTable } from '../db/schema';
import { type SearchInput, type Post, type Page } from '../schema';
import { or, and, ilike, eq, SQL } from 'drizzle-orm';

export interface SearchResult {
    posts: Post[];
    pages: Page[];
    total: number;
}

export async function searchContent(input: SearchInput): Promise<SearchResult> {
  try {
    const searchTerm = `%${input.query}%`;

    // Search posts and pages in parallel
    const [posts, pages] = await Promise.all([
      searchPosts(input),
      searchPages(input)
    ]);

    return {
      posts,
      pages,
      total: posts.length + pages.length
    };
  } catch (error) {
    console.error('Content search failed:', error);
    throw error;
  }
}

export async function searchPosts(input: SearchInput): Promise<Post[]> {
  try {
    const searchTerm = `%${input.query}%`;

    const conditions: SQL<unknown>[] = [];

    // Add search conditions across multiple fields
    conditions.push(
      or(
        ilike(postsTable.title, searchTerm),
        ilike(postsTable.content, searchTerm),
        ilike(postsTable.excerpt, searchTerm),
        ilike(postsTable.seo_title, searchTerm),
        ilike(postsTable.seo_description, searchTerm),
        ilike(postsTable.seo_keywords, searchTerm)
      )!
    );

    // Only return published posts
    conditions.push(eq(postsTable.status, 'published'));

    // Build and execute query
    const results = await db.select()
      .from(postsTable)
      .where(and(...conditions))
      .orderBy(postsTable.published_at)
      .execute();

    return results;
  } catch (error) {
    console.error('Posts search failed:', error);
    throw error;
  }
}

export async function searchPages(input: SearchInput): Promise<Page[]> {
  try {
    const searchTerm = `%${input.query}%`;

    const conditions: SQL<unknown>[] = [];

    // Add search conditions across multiple fields
    conditions.push(
      or(
        ilike(pagesTable.title, searchTerm),
        ilike(pagesTable.content, searchTerm),
        ilike(pagesTable.seo_title, searchTerm),
        ilike(pagesTable.seo_description, searchTerm),
        ilike(pagesTable.seo_keywords, searchTerm)
      )!
    );

    // Only return published pages
    conditions.push(eq(pagesTable.status, 'published'));

    // Build and execute query
    const results = await db.select()
      .from(pagesTable)
      .where(and(...conditions))
      .orderBy(pagesTable.updated_at)
      .execute();

    return results;
  } catch (error) {
    console.error('Pages search failed:', error);
    throw error;
  }
}