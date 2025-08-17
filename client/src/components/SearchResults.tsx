import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, SearchIcon, FileTextIcon, BookOpenIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Post, Page } from '../../../server/src/schema';

interface ViewState {
  type: 'home' | 'post' | 'page' | 'search' | 'admin-login' | 'admin';
  slug?: string;
  query?: string;
}

interface SearchResult {
  posts: Post[];
  pages: Page[];
  total: number;
}

interface SearchResultsProps {
  query: string;
  onNavigate: (view: ViewState) => void;
}

export function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  const performSearch = useCallback(async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const searchResults = await trpc.blog.search.query({
        query: searchTerm,
        type: 'all'
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ posts: [], pages: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

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
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => onNavigate({ type: 'home' })}
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      {/* Search Header */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-600">
            {results ? `${results.total} results` : 'Searching'} for "{query}"
          </p>
        </div>

        {/* Search Form */}
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
      </div>

      {/* Search Results */}
      <div className="space-y-6">
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
        ) : !results || results.total === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No results found</div>
              <p className="text-gray-400">
                Try adjusting your search terms or check the spelling.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Posts Results */}
            {results.posts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Posts ({results.posts.length})
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {results.posts.map((post: Post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <button
                              onClick={() => onNavigate({ type: 'post', slug: post.slug })}
                              className="text-left w-full"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {post.title}
                              </h3>
                            </button>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDate(post.published_at || post.created_at)}</span>
                              <span>•</span>
                              <span>Post</span>
                            </div>
                          </div>
                          
                          <Badge className={getStatusColor(post.status)} variant="secondary">
                            {post.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      {post.excerpt && (
                        <CardContent>
                          <p className="text-gray-600 leading-relaxed text-sm">{post.excerpt}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Pages Results */}
            {results.pages.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpenIcon className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pages ({results.pages.length})
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {results.pages.map((page: Page) => (
                    <Card key={page.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <button
                              onClick={() => onNavigate({ type: 'page', slug: page.slug })}
                              className="text-left w-full"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors">
                                {page.title}
                              </h3>
                            </button>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDate(page.published_at || page.created_at)}</span>
                              <span>•</span>
                              <span>Page</span>
                            </div>
                          </div>
                          
                          <Badge className={getStatusColor(page.status)} variant="secondary">
                            {page.status}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}