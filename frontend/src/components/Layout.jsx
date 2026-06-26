import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, CalendarDays, Receipt, HeartPulse, 
  ShieldCheck, Award, MessageSquare, LogOut, Menu, X, Bell, User as UserIcon
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/communication');
        if (res.data.success) {
          setNotifications(res.data.data.slice(0, 5)); // show top 5
        }
      } catch (err) {
        console.warn('Failed to fetch navbar notifications:', err.message);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define navigation items based on role
  const getNavItems = () => {
    const role = user?.role;
    const baseItems = [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Students', path: '/students', icon: Users },
      { name: 'Attendance', path: '/attendance', icon: CalendarDays },
    ];

    if (role === 'Super Admin' || role === 'School Admin') {
      return [
        ...baseItems,
        { name: 'Fees & Invoices', path: '/fees', icon: Receipt },
        { name: 'Medical Center', path: '/medical', icon: HeartPulse },
        { name: 'Pickup System', path: '/pickup', icon: ShieldCheck },
        { name: 'Development Logs', path: '/progress', icon: Award },
        { name: 'Communication', path: '/communication', icon: MessageSquare },
      ];
    }

    if (role === 'Teacher') {
      return [
        ...baseItems,
        { name: 'Medical Alerts', path: '/medical', icon: HeartPulse },
        { name: 'Learning Progress', path: '/progress', icon: Award },
        { name: 'Communication', path: '/communication', icon: MessageSquare },
      ];
    }

    if (role === 'Parent') {
      return [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Child Profile', path: '/students', icon: Users },
        { name: 'Attendance', path: '/attendance', icon: CalendarDays },
        { name: 'Billing & Fees', path: '/fees', icon: Receipt },
        { name: 'Health & Allergies', path: '/medical', icon: HeartPulse },
        { name: 'Authorized Pickups', path: '/pickup', icon: ShieldCheck },
        { name: 'Learning Progress', path: '/progress', icon: Award },
        { name: 'School Bulletin', path: '/communication', icon: MessageSquare },
      ];
    }

    if (role === 'Front Desk Staff') {
      return [
        ...baseItems,
        { name: 'Medical Center', path: '/medical', icon: HeartPulse },
        { name: 'Pickup Verification', path: '/pickup', icon: ShieldCheck },
        { name: 'Announcements', path: '/communication', icon: MessageSquare },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex text-slate-100 relative">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-sidebar-gradient border-r border-slate-800/40 shrink-0 h-screen sticky top-0">
        {/* Brand Logo */}
        <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-900/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center font-display font-black text-xl text-white shadow-glow-purple">
            FI
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-white tracking-tight leading-none">FirstCry Intellitots</h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gradient-purple-blue">Profile Manager</span>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-purple/20 to-brand-blue/10 border-l-[3px] border-brand-purple text-white shadow-glow-purple'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-purple' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/20 bg-slate-950/20">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-850/20 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-brand-blue/40 flex items-center justify-center text-brand-blue font-semibold">
              {user?.name?.[0]}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-slate-900/80 rounded-full border border-slate-800 inline-block mt-0.5">{user?.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-sidebar-gradient border-r border-slate-800/40 z-50 flex flex-col h-full lg:hidden"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center font-display font-black text-xl text-white">
                    FI
                  </div>
                  <div>
                    <h1 className="text-lg font-bold font-display text-white tracking-tight">Intellitots</h1>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                        isActive 
                          ? 'bg-gradient-to-r from-brand-purple/20 to-brand-blue/10 border-l-[3px] border-brand-purple text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800/20">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Header/Navbar */}
        <header className="h-20 border-b border-slate-800/30 bg-slate-950/40 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between sticky top-0 z-35">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="hidden sm:block text-gradient-purple-blue text-xl font-bold font-display uppercase tracking-wider">
              {location.pathname === '/' ? 'School Dashboard' : location.pathname.substring(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification Panel */}
            <div className="relative">
              <button 
                onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); setProfileDropdownOpen(false); }}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan shadow-glow-cyan" />
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-80 glass-panel p-4 z-50 space-y-3"
                    >
                      <h4 className="text-sm font-bold text-white border-b border-slate-800/40 pb-2">Recent Announcements</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">No recent notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="text-xs space-y-1 pb-2 border-b border-slate-900/30 last:border-b-0">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                n.type === 'Alert' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20'
                              }`}>{n.type}</span>
                              <p className="font-semibold text-slate-200">{n.title}</p>
                              <p className="text-slate-500 line-clamp-2">{n.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link to="/communication" onClick={() => setNotifDropdownOpen(false)} className="block text-center text-xs font-bold text-brand-cyan hover:underline pt-1">
                        View Board Center
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotifDropdownOpen(false); }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900/60 border border-slate-800/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold">
                  {user?.name?.[0]}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-300">{user?.name}</span>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 glass-panel p-2.5 z-50 space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-slate-850/40 mb-1.5">
                        <p className="text-xs text-slate-500">Logged in as</p>
                        <p className="text-sm font-bold text-slate-200 truncate">{user?.email}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
