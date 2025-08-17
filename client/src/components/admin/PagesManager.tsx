import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  PlusIcon, 
  SearchIcon, 
  EditIcon, 
  TrashIcon, 
  MoreVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  CalendarIcon
} from 'lucide-react';
import { PageEditor } from './PageEditor';
import { trpc } from '@/utils/trpc';
import type { Page } from '../../../../server/src/schema';

type ViewMode = 'list' | 'create' | 'edit';

export function PagesManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);

  const loadPages = useCallback(async () => {
    try {
      setIsLoading(true);
      const allPages = await trpc.admin.pages.getAll.query();
      setPages(allPages);
      setFilteredPages(allPages);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = pages.filter((page: Page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages(pages);
    }
  }, [searchQuery, pages]);

  const handlePageSaved = () => {
    setViewMode('list');
    setEditingPage(null);
    loadPages();
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setViewMode('edit');
  };

  const handleDeletePage = async (page: Page) => {
    try {
      await trpc.admin.pages.delete.mutate({ id: page.id });
      setDeletingPage(null);
      loadPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const handlePublishToggle = async (page: Page) => {
    try {
      if (page.status === 'published') {
        await trpc.admin.pages.unpublish.mutate({ id: page.id });
      } else {
        await trpc.admin.pages.publish.mutate({ id: page.id });
      }
      loadPages();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      case 'unpublished':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'create') {
    return (
      <PageEditor
        onSave={handlePageSaved}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'edit' && editingPage) {
    return (
      <PageEditor
        page={editingPage}
        onSave={handlePageSaved}
        onCancel={() => {
          setViewMode('list');
          setEditingPage(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pages Management</h2>
          <p className="text-gray-600">Create and manage static pages</p>
        </div>
        <Button onClick={() => setViewMode('create')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredPages.length} of {pages.length} pages
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 p-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No pages found</div>
              <p className="text-gray-400 mt-2">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first page!'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setViewMode('create')} 
                  className="mt-4"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Page
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page: Page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {page.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{page.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(page.status)} variant="secondary">
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {page.published_at ? (
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(page.published_at)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not published</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {formatDate(page.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPage(page)}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePublishToggle(page)}>
                            {page.status === 'published' ? (
                              <>
                                <EyeOffIcon className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingPage(page)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPage} onOpenChange={() => setDeletingPage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page
              "{deletingPage?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingPage && handleDeletePage(deletingPage)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}