import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, ArrowLeftIcon, MessageCircleIcon, UserIcon, MailIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Post, Comment, CreateCommentInput } from '../../../server/src/schema';

interface ViewState {
  type: 'home' | 'post' | 'page' | 'search' | 'admin-login' | 'admin';
  slug?: string;
  query?: string;
}

interface BlogPostProps {
  slug: string;
  onNavigate: (view: ViewState) => void;
}

export function BlogPost({ slug, onNavigate }: BlogPostProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const [commentForm, setCommentForm] = useState<CreateCommentInput>({
    post_id: 0,
    author_name: '',
    author_email: '',
    content: ''
  });

  const loadPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedPost = await trpc.blog.getPost.query({ slug });
      setPost(fetchedPost);
      
      if (fetchedPost) {
        setCommentForm((prev: CreateCommentInput) => ({ 
          ...prev, 
          post_id: fetchedPost.id 
        }));
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const loadComments = useCallback(async () => {
    if (!post) return;
    
    try {
      setIsCommentsLoading(true);
      const postComments = await trpc.blog.getPostComments.query({ id: post.id });
      setComments(postComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [post]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (post) {
      loadComments();
    }
  }, [loadComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentForm.author_name.trim() || !commentForm.author_email.trim() || !commentForm.content.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    try {
      await trpc.blog.createComment.mutate(commentForm);
      setCommentForm((prev: CreateCommentInput) => ({
        ...prev,
        author_name: '',
        author_email: '',
        content: ''
      }));
      // Refresh comments after submission
      loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate({ type: 'home' })}
          className="mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate({ type: 'home' })}
          className="mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card>
          <CardContent className="py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
            <p className="text-gray-600">The post you're looking for doesn't exist or hasn't been published yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => onNavigate({ type: 'home' })}
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      {/* Post Content */}
      <article className="space-y-6">
        {/* Post Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {post.status}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(post.published_at || post.created_at)}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        <Separator />

        {/* Post Content */}
        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
            {post.content}
          </div>
        </div>

        {/* SEO and OG metadata (visible for demonstration) */}
        {(post.seo_title || post.seo_description || post.seo_keywords || post.og_title || post.og_description) && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-2 text-sm">
              {post.seo_title && (
                <div><strong>SEO Title:</strong> {post.seo_title}</div>
              )}
              {post.seo_description && (
                <div><strong>SEO Description:</strong> {post.seo_description}</div>
              )}
              {post.seo_keywords && (
                <div><strong>Keywords:</strong> {post.seo_keywords}</div>
              )}
              {post.og_title && (
                <div><strong>OG Title:</strong> {post.og_title}</div>
              )}
              {post.og_description && (
                <div><strong>OG Description:</strong> {post.og_description}</div>
              )}
            </div>
          </div>
        )}
      </article>

      <Separator />

      {/* Comments Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <MessageCircleIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Leave a Comment</h3>
            <p className="text-sm text-gray-600">Your comment will be reviewed before publication.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={commentForm.author_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCommentForm((prev: CreateCommentInput) => ({ 
                        ...prev, 
                        author_name: e.target.value 
                      }))
                    }
                    required
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MailIcon className="h-4 w-4 mr-1" />
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={commentForm.author_email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCommentForm((prev: CreateCommentInput) => ({ 
                        ...prev, 
                        author_email: e.target.value 
                      }))
                    }
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Comment *
                </label>
                <Textarea
                  value={commentForm.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCommentForm((prev: CreateCommentInput) => ({ 
                      ...prev, 
                      content: e.target.value 
                    }))
                  }
                  required
                  rows={4}
                  placeholder="Share your thoughts..."
                />
              </div>
              
              <Button type="submit" disabled={isSubmittingComment}>
                {isSubmittingComment ? 'Submitting...' : 'Submit Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {isCommentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="py-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-gray-500">No comments yet.</div>
                <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment: Comment) => (
              <Card key={comment.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{comment.author_name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}