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
import type { Page, CreatePageInput, UpdatePageInput, ContentStatus } from '../../../../server/src/schema';

interface PageEditorProps {
  page?: Page;
  onSave: () => void;
  onCancel: () => void;
}

export function PageEditor({ page, onSave, onCancel }: PageEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePageInput>({
    title: page?.title || '',
    content: page?.content || '',
    status: (page?.status as ContentStatus) || 'draft',
    scheduled_at: page?.scheduled_at ?? null,
    seo_title: page?.seo_title ?? null,
    seo_description: page?.seo_description ?? null,
    seo_keywords: page?.seo_keywords ?? null,
    og_title: page?.og_title ?? null,
    og_description: page?.og_description ?? null,
    og_image_url: page?.og_image_url ?? null,
    og_type: page?.og_type ?? null,
    og_url: page?.og_url ?? null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (page) {
        // Updating existing page
        const updateData: UpdatePageInput = {
          id: page.id,
          ...formData
        };
        await trpc.admin.pages.update.mutate(updateData);
      } else {
        // Creating new page
        await trpc.admin.pages.create.mutate(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof CreatePageInput, value: any) => {
    setFormData((prev: CreatePageInput) => ({
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
            Back to Pages
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {page ? 'Edit Page' : 'Create New Page'}
            </h2>
            <p className="text-gray-600">
              {page ? `Editing "${page.title}"` : 'Create a new static page'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.title.trim()}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Page'}
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
                    placeholder="Enter page title..."
                    required
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
                    placeholder="Write your page content here... (Markdown supported)"
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
                  Optimize your page for search engines and social media
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
                          placeholder="website"
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
                          placeholder="https://yourblog.com/page-url"
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
                  {page && (
                    <>
                      <div>Created: {page.created_at.toLocaleDateString()}</div>
                      <div>Modified: {page.updated_at.toLocaleDateString()}</div>
                      {page.published_at && (
                        <div>Published: {page.published_at.toLocaleDateString()}</div>
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
                      {formData.title || 'Untitled Page'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Static page
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview Page
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