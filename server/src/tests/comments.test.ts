import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable, commentsTable } from '../db/schema';
import { type CreateCommentInput, type UpdateCommentStatusInput, type IdInput } from '../schema';
import { createComment, updateCommentStatus, deleteComment, getPostComments, getAllComments, getPendingComments } from '../handlers/comments';
import { eq } from 'drizzle-orm';

// Test data
const testPost = {
  title: 'Test Post',
  slug: 'test-post',
  content: 'This is a test post content',
  status: 'published' as const,
  published_at: new Date()
};

const testCommentInput: CreateCommentInput = {
  post_id: 1, // Will be set after creating test post
  author_name: 'John Doe',
  author_email: 'john@example.com',
  content: 'This is a test comment'
};

describe('createComment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a comment with approval set to false', async () => {
    // Create test post first
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    const commentInput = { ...testCommentInput, post_id: postResult[0].id };
    const result = await createComment(commentInput);

    // Verify comment fields
    expect(result.post_id).toEqual(postResult[0].id);
    expect(result.author_name).toEqual('John Doe');
    expect(result.author_email).toEqual('john@example.com');
    expect(result.content).toEqual('This is a test comment');
    expect(result.is_approved).toEqual(false); // Should be false by default
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save comment to database', async () => {
    // Create test post first
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    const commentInput = { ...testCommentInput, post_id: postResult[0].id };
    const result = await createComment(commentInput);

    // Verify comment was saved
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, result.id))
      .execute();

    expect(comments).toHaveLength(1);
    expect(comments[0].author_name).toEqual('John Doe');
    expect(comments[0].content).toEqual('This is a test comment');
    expect(comments[0].is_approved).toEqual(false);
  });

  it('should throw error if post does not exist', async () => {
    const commentInput = { ...testCommentInput, post_id: 999 };
    
    await expect(createComment(commentInput)).rejects.toThrow(/post not found/i);
  });
});

describe('updateCommentStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should approve a comment', async () => {
    // Create test post and comment
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    const commentResult = await db.insert(commentsTable)
      .values({
        post_id: postResult[0].id,
        author_name: 'Jane Doe',
        author_email: 'jane@example.com',
        content: 'Test comment for approval',
        is_approved: false
      })
      .returning()
      .execute();

    const updateInput: UpdateCommentStatusInput = {
      id: commentResult[0].id,
      is_approved: true
    };

    const result = await updateCommentStatus(updateInput);

    expect(result.id).toEqual(commentResult[0].id);
    expect(result.is_approved).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should disapprove a comment', async () => {
    // Create approved comment
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    const commentResult = await db.insert(commentsTable)
      .values({
        post_id: postResult[0].id,
        author_name: 'Jane Doe',
        author_email: 'jane@example.com',
        content: 'Test comment for disapproval',
        is_approved: true
      })
      .returning()
      .execute();

    const updateInput: UpdateCommentStatusInput = {
      id: commentResult[0].id,
      is_approved: false
    };

    const result = await updateCommentStatus(updateInput);

    expect(result.is_approved).toEqual(false);
  });

  it('should throw error if comment does not exist', async () => {
    const updateInput: UpdateCommentStatusInput = {
      id: 999,
      is_approved: true
    };

    await expect(updateCommentStatus(updateInput)).rejects.toThrow(/comment not found/i);
  });
});

describe('deleteComment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a comment', async () => {
    // Create test post and comment
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    const commentResult = await db.insert(commentsTable)
      .values({
        post_id: postResult[0].id,
        author_name: 'Delete Me',
        author_email: 'delete@example.com',
        content: 'Comment to be deleted',
        is_approved: false
      })
      .returning()
      .execute();

    const deleteInput: IdInput = { id: commentResult[0].id };
    const result = await deleteComment(deleteInput);

    expect(result.success).toEqual(true);

    // Verify comment is deleted
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, commentResult[0].id))
      .execute();

    expect(comments).toHaveLength(0);
  });

  it('should throw error if comment does not exist', async () => {
    const deleteInput: IdInput = { id: 999 };

    await expect(deleteComment(deleteInput)).rejects.toThrow(/comment not found/i);
  });
});

describe('getPostComments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only approved comments for a post', async () => {
    // Create test post
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    // Create approved and pending comments
    await db.insert(commentsTable)
      .values([
        {
          post_id: postResult[0].id,
          author_name: 'Approved User',
          author_email: 'approved@example.com',
          content: 'This comment is approved',
          is_approved: true
        },
        {
          post_id: postResult[0].id,
          author_name: 'Pending User',
          author_email: 'pending@example.com',
          content: 'This comment is pending',
          is_approved: false
        }
      ])
      .execute();

    const getInput: IdInput = { id: postResult[0].id };
    const comments = await getPostComments(getInput);

    expect(comments).toHaveLength(1);
    expect(comments[0].author_name).toEqual('Approved User');
    expect(comments[0].is_approved).toEqual(true);
  });

  it('should return empty array if no approved comments exist', async () => {
    // Create test post
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    // Create only pending comment
    await db.insert(commentsTable)
      .values({
        post_id: postResult[0].id,
        author_name: 'Pending User',
        author_email: 'pending@example.com',
        content: 'This comment is pending',
        is_approved: false
      })
      .execute();

    const getInput: IdInput = { id: postResult[0].id };
    const comments = await getPostComments(getInput);

    expect(comments).toHaveLength(0);
  });

  it('should throw error if post does not exist', async () => {
    const getInput: IdInput = { id: 999 };

    await expect(getPostComments(getInput)).rejects.toThrow(/post not found/i);
  });
});

describe('getAllComments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all comments (approved and pending)', async () => {
    // Create test post
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    // Create approved and pending comments
    await db.insert(commentsTable)
      .values([
        {
          post_id: postResult[0].id,
          author_name: 'Approved User',
          author_email: 'approved@example.com',
          content: 'This comment is approved',
          is_approved: true
        },
        {
          post_id: postResult[0].id,
          author_name: 'Pending User',
          author_email: 'pending@example.com',
          content: 'This comment is pending',
          is_approved: false
        }
      ])
      .execute();

    const comments = await getAllComments();

    expect(comments).toHaveLength(2);
    
    // Verify both approved and pending comments are returned
    const approvedComment = comments.find(c => c.author_name === 'Approved User');
    const pendingComment = comments.find(c => c.author_name === 'Pending User');
    
    expect(approvedComment).toBeDefined();
    expect(approvedComment?.is_approved).toEqual(true);
    expect(pendingComment).toBeDefined();
    expect(pendingComment?.is_approved).toEqual(false);
  });

  it('should return empty array if no comments exist', async () => {
    const comments = await getAllComments();
    expect(comments).toHaveLength(0);
  });
});

describe('getPendingComments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only pending comments', async () => {
    // Create test post
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    // Create approved and pending comments
    await db.insert(commentsTable)
      .values([
        {
          post_id: postResult[0].id,
          author_name: 'Approved User',
          author_email: 'approved@example.com',
          content: 'This comment is approved',
          is_approved: true
        },
        {
          post_id: postResult[0].id,
          author_name: 'Pending User 1',
          author_email: 'pending1@example.com',
          content: 'This comment is pending',
          is_approved: false
        },
        {
          post_id: postResult[0].id,
          author_name: 'Pending User 2',
          author_email: 'pending2@example.com',
          content: 'Another pending comment',
          is_approved: false
        }
      ])
      .execute();

    const comments = await getPendingComments();

    expect(comments).toHaveLength(2);
    
    // Verify all returned comments are pending
    comments.forEach(comment => {
      expect(comment.is_approved).toEqual(false);
    });

    const userNames = comments.map(c => c.author_name);
    expect(userNames).toContain('Pending User 1');
    expect(userNames).toContain('Pending User 2');
    expect(userNames).not.toContain('Approved User');
  });

  it('should return empty array if no pending comments exist', async () => {
    // Create test post and approved comment
    const postResult = await db.insert(postsTable)
      .values(testPost)
      .returning()
      .execute();

    await db.insert(commentsTable)
      .values({
        post_id: postResult[0].id,
        author_name: 'Approved User',
        author_email: 'approved@example.com',
        content: 'This comment is approved',
        is_approved: true
      })
      .execute();

    const comments = await getPendingComments();
    expect(comments).toHaveLength(0);
  });
});