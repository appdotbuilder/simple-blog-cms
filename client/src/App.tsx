import { useState, useEffect, useCallback } from 'react';
import { BlogHome } from '@/components/BlogHome';
import { BlogPost } from '@/components/BlogPost';
import { BlogPage } from '@/components/BlogPage';
import { SearchResults } from '@/components/SearchResults';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
// Using type-only import for better TypeScript compliance
import type { User } from '../../server/src/schema';

type ViewType = 'home' | 'post' | 'page' | 'search' | 'admin-login' | 'admin';

interface ViewState {
  type: ViewType;
  slug?: string;
  query?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check for existing authentication on mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('blog-auth-token');
    if (token) {
      try {
        const currentUser = await trpc.auth.getCurrentUser.query({ token });
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Invalid token
          localStorage.removeItem('blog-auth-token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('blog-auth-token');
      }
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await trpc.auth.login.mutate({ username, password });
      setUser(response.user);
      localStorage.setItem('blog-auth-token', response.token);
      setCurrentView({ type: 'admin' });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('blog-auth-token');
    setCurrentView({ type: 'home' });
  };

  const navigate = (view: ViewState) => {
    setCurrentView(view);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate({ type: 'home' })}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                DevBlog
              </button>
              
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => navigate({ type: 'home' })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView.type === 'home'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Home
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button
                    variant={currentView.type === 'admin' ? 'default' : 'outline'}
                    onClick={() => navigate({ type: 'admin' })}
                    size="sm"
                  >
                    Admin Panel
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" size="sm">
                    Logout ({user.username})
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate({ type: 'admin-login' })}
                  variant="outline"
                  size="sm"
                >
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView.type === 'home' && (
          <BlogHome onNavigate={navigate} />
        )}
        
        {currentView.type === 'post' && currentView.slug && (
          <BlogPost slug={currentView.slug} onNavigate={navigate} />
        )}
        
        {currentView.type === 'page' && currentView.slug && (
          <BlogPage slug={currentView.slug} onNavigate={navigate} />
        )}
        
        {currentView.type === 'search' && currentView.query && (
          <SearchResults query={currentView.query} onNavigate={navigate} />
        )}
        
        {currentView.type === 'admin-login' && !user && (
          <AdminLogin onLogin={handleLogin} />
        )}
        
        {currentView.type === 'admin' && user && (
          <AdminDashboard user={user} />
        )}
        
        {currentView.type === 'admin' && !user && (
          <AdminLogin onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;