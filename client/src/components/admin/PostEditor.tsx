import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftIcon, SaveIcon, EyeIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Post, CreatePostInput, UpdatePostInput, ContentStatus } from '../../../../server/src/schema';

interface PostEditorProps {
  post?: Post;
  onSave: () => void;
  onCancel: () => void;
}

export function PostEditor({ post, onSave, onCancel }: PostEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePostInput>({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || null,
    status: (post?.status as ContentStatus) || 'draft',
    scheduled_at: post?.scheduled_at ?? null,
    seo_title: post?.seo_title ?? null,
    seo_description: post?.seo_description ?? null,
    seo_keywords: post?.seo_keywords ?? null,
    og_title: post?.og_title ?? null,
    og_description: post?.og_description ?? null,
    og_image_url: post?.og_image_url ?? null,
    og_type: post?.og_type ?? null,
    og_url: post?.og_url ?? null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (post) {
        // Updating existing post
        const updateData: UpdatePostInput = {
          id: post.id,
          ...formData
        };
        await trpc.admin.posts.update.mutate(updateData);
      } else {
        // Creating new post
        await trpc.admin.posts.create.mutate(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof CreatePostInput, value: any) => {
    setFormData((prev: CreatePostInput) => ({
      ...prev,
      [field]: value || null
    }));
  };

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {post ? 'Edit Post' : 'Create New Post'}
            </h2>
            <p className="text-gray-600">
              {post ? `Editing "${post.title}"` : 'Write and publish a new blog post'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.title.trim()}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleFieldChange('title', e.target.value)
                    }
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      handleFieldChange('excerpt', e.target.value)
                    }
                    placeholder="Brief summary of your post..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      handleFieldChange('content', e.target.value)
                    }
                    placeholder="Write your post content here... (Markdown supported)"
                    rows={12}
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO & Metadata */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">SEO & Metadata</h3>
                <p className="text-sm text-gray-600">
                  Optimize your post for search engines and social media
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="seo" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="opengraph">Open Graph</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo_title">SEO Title</Label>
                      <Input
                        id="seo_title"
                        type="text"
                        value={formData.seo_title || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleFieldChange('seo_title', e.target.value)
                        }
                        placeholder="Title for search engines..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo_description">SEO Description</Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          handleFieldChange('seo_description', e.target.value)
                        }
                        placeholder="Description for search engines..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo_keywords">Keywords</Label>
                      <Input
                        id="seo_keywords"
                        type="text"
                        value={formData.seo_keywords || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleFieldChange('seo_keywords', e.target.value)
                        }
                        placeholder="keyword1, keyword2, keyword3..."
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="opengraph" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="og_title">OG Title</Label>
                      <Input
                        id="og_title"
                        type="text"
                        value={formData.og_title || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleFieldChange('og_title', e.target.value)
                        }
                        placeholder="Title for social media sharing..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="og_description">OG Description</Label>
                      <Textarea
                        id="og_description"
                        value={formData.og_description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          handleFieldChange('og_description', e.target.value)
                        }
                        placeholder="Description for social media..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="og_image_url">Image URL</Label>
                      <Input
                        id="og_image_url"
                        type="url"
                        value={formData.og_image_url || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleFieldChange('og_image_url', e.target.value)
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="og_type">Type</Label>
                        <Input
                          id="og_type"
                          type="text"
                          value={formData.og_type || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleFieldChange('og_type', e.target.value)
                          }
                          placeholder="article"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="og_url">Canonical URL</Label>
                        <Input
                          id="og_url"
                          type="url"
                          value={formData.og_url || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleFieldChange('og_url', e.target.value)
                          }
                          placeholder="https://yourblog.com/post-url"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Publishing</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: ContentStatus) => handleFieldChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Schedule Date</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formatDateForInput(formData.scheduled_at)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleFieldChange('scheduled_at', e.target.value ? new Date(e.target.value) : null)
                      }
                    />
                  </div>
                )}

                <Separator />

                <div className="text-sm text-gray-600 space-y-2">
                  {post && (
                    <>
                      <div>Created: {post.created_at.toLocaleDateString()}</div>
                      <div>Modified: {post.updated_at.toLocaleDateString()}</div>
                      {post.published_at && (
                        <div>Published: {post.published_at.toLocaleDateString()}</div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Preview</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {formData.title || 'Untitled Post'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.excerpt || 'No excerpt provided...'}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}