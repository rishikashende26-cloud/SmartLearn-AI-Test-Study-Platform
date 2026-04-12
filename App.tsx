import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TestModule } from './components/TestModule';
import { SummaryModule } from './components/SummaryModule';
import { ProgressModule } from './components/ProgressModule';
import { ScheduleModule } from './components/ScheduleModule';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './components/UI';

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8">{this.state.error?.message || "An unexpected error occurred."}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} /> Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

type Page = 'auth' | 'dashboard' | 'test' | 'summary' | 'progress' | 'schedule';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('auth');

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('auth');
  };

  const renderContent = () => {
    if (!user || currentPage === 'auth') {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {currentPage === 'dashboard' && (
          <Dashboard 
            user={user} 
            onNavigate={setCurrentPage} 
            onLogout={handleLogout} 
          />
        )}
        {currentPage === 'test' && (
          <TestModule user={user} onBack={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'summary' && (
          <SummaryModule onBack={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'progress' && (
          <ProgressModule user={user} onBack={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'schedule' && (
          <ScheduleModule user={user} onBack={() => setCurrentPage('dashboard')} />
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      {renderContent()}
    </ErrorBoundary>
  );
}
