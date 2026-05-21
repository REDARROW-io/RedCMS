import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Image,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Linkedin,
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { PagesList } from './PagesList';
import { ArticlesList } from './ArticlesList';
import { MediaLibrary } from './MediaLibrary';
import { CategoriesManager } from './CategoriesManager';
import { AuthorsManager } from './AuthorsManager';

interface AdminAppProps {
  page?: string;
  pageId?: string;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'articles', label: 'Articles', icon: Newspaper },
  { id: 'media', label: 'Médias', icon: Image },
  { id: 'categories', label: 'Catégories', icon: FolderOpen },
  { id: 'authors', label: 'Auteurs', icon: Users },
];

export function AdminApp({ page = 'dashboard', pageId }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState(page);

  const navigateTo = (pageId: string) => {
    setCurrentPage(pageId);
    window.history.pushState(null, '', `/admin/${pageId === 'dashboard' ? '' : pageId}`);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pages':
        return <PagesList />;
      case 'articles':
        return <ArticlesList />;
      case 'media':
        return <MediaLibrary />;
      case 'categories':
        return <CategoriesManager />;
      case 'authors':
        return <AuthorsManager />;
      case 'settings':
        return <div className="admin-card"><h2>Paramètres</h2><p className="admin-text-muted admin-mt">Bientôt disponible...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    const nav = navigation.find(n => n.id === currentPage);
    return nav?.label || 'Dashboard';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">R</div>
          <div className="admin-logo-text">
            Red<span>CMS</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Menu</div>
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`admin-nav-item ${currentPage === item.id ? 'active' : ''}`}
              >
                <item.icon className="admin-nav-icon" size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Services</div>
            <a
              href="/api/redlink/redirect"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-item"
              style={{ textDecoration: 'none' }}
            >
              <Linkedin className="admin-nav-icon" size={20} />
              <span>RedLink</span>
            </a>
          </div>

          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Configuration</div>
            <button
              onClick={() => navigateTo('settings')}
              className={`admin-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            >
              <Settings className="admin-nav-icon" size={20} />
              <span>Paramètres</span>
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-menu">
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-info">
              <div className="admin-user-name">Admin</div>
              <div className="admin-user-role">Administrateur</div>
            </div>
            <button 
              className="admin-btn admin-btn-ghost admin-btn-icon sm"
              title="Déconnexion"
              onClick={() => window.location.href = '/admin/logout'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <a href="/admin">Admin</a>
            <ChevronRight size={14} className="admin-breadcrumb-separator" />
            <span>{getPageTitle()}</span>
          </div>
          <div className="admin-topbar-actions">
            <a href="/" target="_blank" className="admin-btn admin-btn-secondary admin-btn-sm">
              Voir le site
            </a>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AdminApp;
