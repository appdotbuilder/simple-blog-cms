import { db } from '../db';
import { commentsTable, postsTable } from '../db/schema';
import { type CreateCommentInput, type UpdateCommentStatusInput, type Comment, type IdInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  try {
    // Verify the post exists first
    const post = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, input.post_id))
      .execute();

    if (post.length === 0) {
      throw new Error('Post not found');
    }

    // Insert comment record - comments are not approved by default for moderation
    const result = await db.insert(commentsTable)
      .values({
        post_id: input.post_id,
        author_name: input.author_name,
        author_email: input.author_email,
        content: input.content,
        is_approved: false // Comments require approval by default
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Comment creation failed:', error);
    throw error;
  }
}

export async function updateCommentStatus(input: UpdateCommentStatusInput): Promise<Comment> {
  try {
    // Update comment approval status
    const result = await db.update(commentsTable)
      .set({ 
        is_approved: input.is_approved,
        updated_at: new Date()
      })
      .where(eq(commentsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Comment not found');
    }

    return result[0];
  } catch (error) {
    console.error('Comment status update failed:', error);
    throw error;
  }
}

export async function deleteComment(input: IdInput): Promise<{ success: boolean }> {
  try {
    const result = await db.delete(commentsTable)
      .where(eq(commentsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Comment not found');
    }

    return { success: true };
  } catch (error) {
    console.error('Comment deletion failed:', error);
    throw error;
  }
}

export async function getPostComments(input: IdInput): Promise<Comment[]> {
  try {
    // Verify the post exists first
    const post = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, input.id))
      .execute();

    if (post.length === 0) {
      throw new Error('Post not found');
    }

    // Fetch only approved comments for public viewing
    const comments = await db.select()
      .from(commentsTable)
      .where(and(
        eq(commentsTable.post_id, input.id),
        eq(commentsTable.is_approved, true)
      ))
      .execute();

    return comments;
  } catch (error) {
    console.error('Fetching post comments failed:', error);
    throw error;
  }
}

export async function getAllComments(): Promise<Comment[]> {
  try {
    // Fetch all comments (approved and pending) for admin dashboard
    const comments = await db.select()
      .from(commentsTable)
      .execute();

    return comments;
  } catch (error) {
    console.error('Fetching all comments failed:', error);
    throw error;
  }
}

export async function getPendingComments(): Promise<Comment[]> {
  try {
    // Fetch only comments pending approval for admin moderation
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.is_approved, false))
      .execute();

    return comments;
  } catch (error) {
    console.error('Fetching pending comments failed:', error);
    throw error;
  }
}