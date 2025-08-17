import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Post } from '../../../server/src/schema';

interface ViewState {
  type: 'home' | 'post' | 'page' | 'search' | 'admin-login' | 'admin';
  slug?: string;
  query?: string;
}

interface BlogHomeProps {
  onNavigate: (view: ViewState) => void;
}

export function BlogHome({ onNavigate }: BlogHomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const publishedPosts = await trpc.blog.getPosts.query();
      setPosts(publishedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ type: 'search', query: searchQuery.trim() });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to DevBlog</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A simple, clean blog focused on development insights, tutorials, and thoughts from the tech world.
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Search posts and pages..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Latest Posts</h2>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 text-lg">No posts published yet.</div>
              <p className="text-gray-400 mt-2">Check back soon for new content!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post: Post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <button
                        onClick={() => onNavigate({ type: 'post', slug: post.slug })}
                        className="text-left w-full"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                      </button>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                        {post.scheduled_at && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>Scheduled for {formatDate(post.scheduled_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(post.status)} variant="secondary">
                      {post.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                {post.excerpt && (
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
                    <button
                      onClick={() => onNavigate({ type: 'post', slug: post.slug })}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block transition-colors"
                    >
                      Read more →
                    </button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-8 border-t border-gray-200">
        <p className="text-gray-500">
          Built with ❤️ using React, TypeScript, and tRPC
        </p>
      </div>
    </div>
  );
}