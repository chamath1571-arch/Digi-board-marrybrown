import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/chicken-production', label: 'Chicken Production', icon: '🍗' },
  { path: '/sauce-tracker', label: 'Sauce Tracker', icon: '🥫' },
  { path: '/notes-alerts', label: 'Notes & Alerts', icon: '📝' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/daily-shifts', label: 'Daily Shifts', icon: '📅' },
  { path: '/weekly-roster', label: 'Weekly Roster', icon: '📆' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">MarryBrown Plenty Valley</h1>
            <p className="text-sm opacity-90">DigiBoard Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs opacity-75 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <nav className="w-48 flex-shrink-0">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}