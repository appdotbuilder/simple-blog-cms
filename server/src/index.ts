import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  loginInputSchema,
  createPostInputSchema,
  updatePostInputSchema,
  createPageInputSchema,
  updatePageInputSchema,
  createCommentInputSchema,
  updateCommentStatusInputSchema,
  searchInputSchema,
  idInputSchema,
  slugInputSchema
} from './schema';

// Import handlers
import { login, getCurrentUser } from './handlers/auth';
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPostById,
  getAllPosts,
  getPublishedPosts,
  publishPost,
  unpublishPost
} from './handlers/posts';
import {
  createPage,
  updatePage,
  deletePage,
  getPage,
  getPageById,
  getAllPages,
  getPublishedPages,
  publishPage,
  unpublishPage
} from './handlers/pages';
import {
  createComment,
  updateCommentStatus,
  deleteComment,
  getPostComments,
  getAllComments,
  getPendingComments
} from './handlers/comments';
import {
  searchContent,
  searchPosts,
  searchPages
} from './handlers/search';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => login(input)),
    getCurrentUser: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => getCurrentUser(input.token)),
  }),

  // Public blog routes
  blog: router({
    // Get published posts for public viewing
    getPosts: publicProcedure
      .query(() => getPublishedPosts()),
    // Get single post by slug
    getPost: publicProcedure
      .input(slugInputSchema)
      .query(({ input }) => getPost(input)),
    // Get published pages
    getPages: publicProcedure
      .query(() => getPublishedPages()),
    // Get single page by slug
    getPage: publicProcedure
      .input(slugInputSchema)
      .query(({ input }) => getPage(input)),
    // Get approved comments for a post
    getPostComments: publicProcedure
      .input(idInputSchema)
      .query(({ input }) => getPostComments(input)),
    // Create a comment (public)
    createComment: publicProcedure
      .input(createCommentInputSchema)
      .mutation(({ input }) => createComment(input)),
    // Search content
    search: publicProcedure
      .input(searchInputSchema)
      .query(({ input }) => searchContent(input)),
  }),

  // Admin CMS routes
  admin: router({
    // Post management
    posts: router({
      getAll: publicProcedure
        .query(() => getAllPosts()),
      getById: publicProcedure
        .input(idInputSchema)
        .query(({ input }) => getPostById(input)),
      create: publicProcedure
        .input(createPostInputSchema)
        .mutation(({ input }) => createPost(input)),
      update: publicProcedure
        .input(updatePostInputSchema)
        .mutation(({ input }) => updatePost(input)),
      delete: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => deletePost(input)),
      publish: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => publishPost(input)),
      unpublish: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => unpublishPost(input)),
      search: publicProcedure
        .input(searchInputSchema)
        .query(({ input }) => searchPosts(input)),
    }),

    // Page management
    pages: router({
      getAll: publicProcedure
        .query(() => getAllPages()),
      getById: publicProcedure
        .input(idInputSchema)
        .query(({ input }) => getPageById(input)),
      create: publicProcedure
        .input(createPageInputSchema)
        .mutation(({ input }) => createPage(input)),
      update: publicProcedure
        .input(updatePageInputSchema)
        .mutation(({ input }) => updatePage(input)),
      delete: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => deletePage(input)),
      publish: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => publishPage(input)),
      unpublish: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => unpublishPage(input)),
      search: publicProcedure
        .input(searchInputSchema)
        .query(({ input }) => searchPages(input)),
    }),

    // Comment moderation
    comments: router({
      getAll: publicProcedure
        .query(() => getAllComments()),
      getPending: publicProcedure
        .query(() => getPendingComments()),
      updateStatus: publicProcedure
        .input(updateCommentStatusInputSchema)
        .mutation(({ input }) => updateCommentStatus(input)),
      delete: publicProcedure
        .input(idInputSchema)
        .mutation(({ input }) => deleteComment(input)),
    }),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Blog CMS TRPC server listening at port: ${port}`);
}

start();