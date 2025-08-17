import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, ArrowLeftIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Page } from '../../../server/src/schema';

interface ViewState {
  type: 'home' | 'post' | 'page' | 'search' | 'admin-login' | 'admin';
  slug?: string;
  query?: string;
}

interface BlogPageProps {
  slug: string;
  onNavigate: (view: ViewState) => void;
}

export function BlogPage({ slug, onNavigate }: BlogPageProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedPage = await trpc.blog.getPage.query({ slug });
      setPage(fetchedPage);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

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

  if (!page) {
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">The page you're looking for doesn't exist or hasn't been published yet.</p>
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

      {/* Page Content */}
      <article className="space-y-6">
        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {page.status}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(page.published_at || page.created_at)}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {page.title}
          </h1>
        </header>

        <Separator />

        {/* Page Content */}
        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
            {page.content}
          </div>
        </div>

        {/* SEO and OG metadata (visible for demonstration) */}
        {(page.seo_title || page.seo_description || page.seo_keywords || page.og_title || page.og_description) && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-2 text-sm">
              {page.seo_title && (
                <div><strong>SEO Title:</strong> {page.seo_title}</div>
              )}
              {page.seo_description && (
                <div><strong>SEO Description:</strong> {page.seo_description}</div>
              )}
              {page.seo_keywords && (
                <div><strong>Keywords:</strong> {page.seo_keywords}</div>
              )}
              {page.og_title && (
                <div><strong>OG Title:</strong> {page.og_title}</div>
              )}
              {page.og_description && (
                <div><strong>OG Description:</strong> {page.og_description}</div>
              )}
            </div>
          </div>
        )}
      </article>

      {/* Updated timestamp */}
      <div className="text-center pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Last updated: {formatDate(page.updated_at)}
        </p>
      </div>
    </div>
  );
}