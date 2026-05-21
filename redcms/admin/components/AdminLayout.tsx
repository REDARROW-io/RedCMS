import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  Newspaper, 
  FolderOpen,
  Users,
  Image,
  Settings,
  LogOut 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'pages', label: 'Pages', icon: FileText, href: '/admin/pages' },
  { id: 'articles', label: 'Articles', icon: Newspaper, href: '/admin/articles' },
  { id: 'categories', label: 'Catégories', icon: FolderOpen, href: '/admin/categories' },
  { id: 'authors', label: 'Auteurs', icon: Users, href: '/admin/authors' },
  { id: 'media', label: 'Médias', icon: Image, href: '/admin/media' },
  { id: 'settings', label: 'Paramètres', icon: Settings, href: '/admin/settings' },
];

export function AdminLayout({ children, currentPage = 'dashboard' }: AdminLayoutProps) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin';
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          RedCMS
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`admin-nav-item ${currentPage === item.id ? 'active' : ''}`}
            >
              <item.icon />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="admin-user">
          <div className="admin-user-avatar">
            {userInitial}
          </div>
          <div className="admin-user-info">
            <div className="admin-user-name">Admin</div>
            <div className="admin-user-email">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: 4
            }}
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
