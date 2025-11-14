import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuByRole = {
  admin: [
    { path: '/dashboard', label: 'Dashboard Overview', icon: '📊' },
    { path: '/dashboard?section=users', label: 'Manage Users', icon: '👥' },
    { path: '/dashboard?section=orders', label: 'Orders Insights', icon: '📦' },
  ],
  sme: [
    { path: '/dashboard', label: 'Operations Dashboard', icon: '📦' },
    { path: '/dashboard?section=performance', label: 'Performance', icon: '📈' },
  ],
  driver: [
    { path: '/dashboard', label: 'My Deliveries', icon: '🚚' },
    { path: '/dashboard?section=history', label: 'Delivery History', icon: '🗂️' },
  ],
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = useMemo(() => {
    if (!user?.role) return menuByRole.sme;
    return menuByRole[user.role] || menuByRole.sme;
  }, [user?.role]);

  return (
    <aside className="hidden w-72 flex-col bg-slate-900 text-white lg:flex">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-lg font-bold text-white">
            MP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">M-PARCEL</p>
            <p className="text-xs text-slate-400">Logistics Control</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path.split('?')[0];
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

