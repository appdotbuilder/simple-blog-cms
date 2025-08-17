import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileTextIcon, 
  BookOpenIcon, 
  MessageCircleIcon, 
  PlusIcon,
  SettingsIcon,
  BarChart3Icon
} from 'lucide-react';
import { PostsManager } from '@/components/admin/PostsManager';
import { PagesManager } from '@/components/admin/PagesManager';
import { CommentsManager } from '@/components/admin/CommentsManager';
import type { User } from '../../../server/src/schema';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.username}!</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <SettingsIcon className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3Icon className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center space-x-2">
            <FileTextIcon className="h-4 w-4" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center space-x-2">
            <BookOpenIcon className="h-4 w-4" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center space-x-2">
            <MessageCircleIcon className="h-4 w-4" />
            <span>Comments</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Total Posts</h3>
                <FileTextIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-gray-500">+2 this month</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Total Pages</h3>
                <BookOpenIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-gray-500">+1 this month</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Pending Comments</h3>
                <MessageCircleIcon className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-gray-500">Awaiting moderation</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Published</h3>
                <BarChart3Icon className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-gray-500">Total content</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setActiveTab('posts')} 
                  className="justify-start h-auto p-4"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">New Post</div>
                      <div className="text-sm text-gray-500">Create a blog post</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => setActiveTab('pages')} 
                  className="justify-start h-auto p-4"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-600 rounded-lg p-2">
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">New Page</div>
                      <div className="text-sm text-gray-500">Create a static page</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => setActiveTab('comments')} 
                  className="justify-start h-auto p-4"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-lg p-2">
                      <MessageCircleIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Review Comments</div>
                      <div className="text-sm text-gray-500">Moderate comments</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1">
                      <FileTextIcon className="h-3 w-3" />
                    </div>
                    <span>New post "Getting Started with React" was published</span>
                  </div>
                  <span className="text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-1">
                      <MessageCircleIcon className="h-3 w-3" />
                    </div>
                    <span>3 new comments awaiting moderation</span>
                  </div>
                  <span className="text-gray-500">4 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-600 rounded-full p-1">
                      <BookOpenIcon className="h-3 w-3" />
                    </div>
                    <span>Page "About Us" was updated</span>
                  </div>
                  <span className="text-gray-500">Yesterday</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <PostsManager />
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages">
          <PagesManager />
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <CommentsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}