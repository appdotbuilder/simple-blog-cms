import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SearchIcon, 
  CheckIcon, 
  XIcon, 
  TrashIcon, 
  MoreVerticalIcon,
  MessageCircleIcon,
  UserIcon,
  MailIcon,
  CalendarIcon
} from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Comment } from '../../../../server/src/schema';

export function CommentsManager() {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allCommentsData, pendingCommentsData] = await Promise.all([
        trpc.admin.comments.getAll.query(),
        trpc.admin.comments.getPending.query()
      ]);
      
      setAllComments(allCommentsData);
      setPendingComments(pendingCommentsData);
      
      // Set filtered comments based on active tab
      if (activeTab === 'pending') {
        setFilteredComments(pendingCommentsData);
      } else {
        setFilteredComments(allCommentsData);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    const sourceComments = activeTab === 'pending' ? pendingComments : allComments;
    
    if (searchQuery.trim()) {
      const filtered = sourceComments.filter((comment: Comment) =>
        comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredComments(filtered);
    } else {
      setFilteredComments(sourceComments);
    }
  }, [searchQuery, allComments, pendingComments, activeTab]);

  const handleApproveComment = async (comment: Comment) => {
    try {
      await trpc.admin.comments.updateStatus.mutate({
        id: comment.id,
        is_approved: true
      });
      loadComments();
    } catch (error) {
      console.error('Failed to approve comment:', error);
    }
  };

  const handleRejectComment = async (comment: Comment) => {
    try {
      await trpc.admin.comments.updateStatus.mutate({
        id: comment.id,
        is_approved: false
      });
      loadComments();
    } catch (error) {
      console.error('Failed to reject comment:', error);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    try {
      await trpc.admin.comments.delete.mutate({ id: comment.id });
      setDeletingComment(null);
      loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? 'Approved' : 'Pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comments Management</h2>
          <p className="text-gray-600">Moderate and manage user comments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                <MessageCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{allComments.length}</div>
                <div className="text-sm text-gray-500">Total Comments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 text-yellow-600 rounded-lg p-2">
                <MessageCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingComments.length}</div>
                <div className="text-sm text-gray-500">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 rounded-lg p-2">
                <CheckIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {allComments.filter(c => c.is_approved).length}
                </div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Comments</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingComments.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 p-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg">No comments found</div>
              <p className="text-gray-400 mt-2">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : activeTab === 'pending' 
                    ? 'No comments are pending review'
                    : 'No comments have been submitted yet'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment: Comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {comment.author_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MailIcon className="h-3 w-3 mr-1" />
                          {comment.author_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="text-sm text-gray-800 line-clamp-3">
                          {comment.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Post ID: {comment.post_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={getStatusColor(comment.is_approved)} 
                        variant="secondary"
                      >
                        {getStatusText(comment.is_approved)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(comment.created_at)}
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
                          {!comment.is_approved ? (
                            <DropdownMenuItem onClick={() => handleApproveComment(comment)}>
                              <CheckIcon className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRejectComment(comment)}>
                              <XIcon className="h-4 w-4 mr-2" />
                              Unapprove
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeletingComment(comment)}
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
      <AlertDialog open={!!deletingComment} onOpenChange={() => setDeletingComment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the comment
              from "{deletingComment?.author_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingComment && handleDeleteComment(deletingComment)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}