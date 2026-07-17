'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, FolderTree, Layers, Menu as MenuIcon,
  ImageIcon, ShoppingCart, Users, Tag, MessageSquare, FileText,
  Settings, LogOut, PanelLeftClose, PanelLeftOpen, Moon, Sun, BarChart3,
} from 'lucide-react';
import { m } from 'framer-motion';
import { useAuth } from '@/store/auth';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/menus', label: 'Mega Menu', icon: MenuIcon },
  { href: '/admin/banners', label: 'Hero Slider', icon: ImageIcon },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/blogs', label: 'Blog', icon: FileText },
  { href: '/admin/cms', label: 'CMS Pages', icon: FileText },
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sarwa_admin_dark') : null;
    if (stored === '1') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    if (typeof window !== 'undefined') localStorage.setItem('sarwa_admin_dark', next ? '1' : '0');
  };

  return (
    <div className={`flex h-screen bg-ivory-50 ${dark ? 'dark' : ''}`}>
      <m.aside
        animate={{ width: collapsed ? 70 : 248 }}
        transition={{ duration: 0.3 }}
        className="border-r border-charcoal-100 bg-white relative"
      >
        <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
          <Link href="/admin" className={`font-serif text-xl tracking-[0.25em] ${collapsed ? 'hidden' : ''}`}>
            SARWA
          </Link>
          <button onClick={() => setCollapsed((c) => !c)} className="p-1.5 hover:bg-ivory rounded">
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                  active
                    ? 'bg-primary text-ivory'
                    : 'text-charcoal hover:bg-ivory'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={16} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-charcoal-100 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-ivory" target="_blank">
            <span className="text-charcoal-300">↗</span>
            {!collapsed && <span>View Store</span>}
          </Link>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-ivory text-red-600"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </m.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-charcoal-100 bg-white px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-champagne-500">SARWA Admin</span>
            <h1 className="font-serif text-2xl">{currentLabel(pathname)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded hover:bg-ivory">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.firstName ?? user?.email ?? 'Admin'}</p>
              <p className="text-[11px] text-charcoal-300">{user?.role}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function currentLabel(path: string): string {
  if (!path || path === '/admin') return 'Dashboard';
  const item = NAV.find((n) => n.href !== '/admin' && path.startsWith(n.href));
  return item?.label ?? 'Admin';
}
