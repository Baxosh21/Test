import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Search, 
  Users, 
  Trophy, 
  BookOpen, 
  Handshake, 
  Newspaper, 
  Briefcase, 
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tabs = [
    { id: 'home', label: 'Home', icon: Layout },
    { id: 'id-check', label: 'ID Check', icon: ShieldCheck },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'hof', label: 'Hall of Fame', icon: Trophy },
    { id: 'wiki', label: 'Wiki', icon: BookOpen },
    { id: 'media', label: 'Media', icon: Newspaper },
    { id: 'hr', label: 'HR', icon: Briefcase },
    { id: 'partners', label: 'Partners', icon: Handshake },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent-cyan rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.5)]">
            <ShieldCheck className="text-bg-dark" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase italic">NextGen Council</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "text-sm font-medium transition-all hover:text-accent-cyan flex items-center gap-2",
                activeTab === tab.id ? "text-accent-cyan" : "text-white/60"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass border-t border-white/10 p-6 flex flex-col gap-4 lg:hidden"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsOpen(false); }}
                className={cn(
                  "text-lg font-medium flex items-center gap-3 p-3 rounded-lg transition-all",
                  activeTab === tab.id ? "bg-accent-cyan/20 text-accent-cyan" : "text-white/60 hover:bg-white/5"
                )}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Home = () => (
  <div className="pt-32 px-6 max-w-7xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-20"
    >
      <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter mb-6">
        Empowering the <span className="text-accent-cyan">Next Generation</span>
      </h1>
      <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
        NextGen Council is a premier organization dedicated to fostering leadership, digital innovation, and community activism among youth.
      </p>
      <div className="flex justify-center gap-4">
        <button className="px-8 py-4 bg-accent-cyan text-bg-dark font-bold rounded-full hover:shadow-[0_0_30px_rgba(0,242,255,0.6)] transition-all">
          Join the Council
        </button>
        <button className="px-8 py-4 glass font-bold rounded-full hover:bg-white/20 transition-all">
          Learn More
        </button>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      <div className="glass p-8 neon-cyan">
        <ShieldCheck className="text-accent-cyan mb-4" size={40} />
        <h3 className="text-2xl font-bold mb-2">Digital Identity</h3>
        <p className="text-white/60">Secure, verifiable digital badges for every activist in our network.</p>
      </div>
      <div className="glass p-8 neon-purple">
        <Users className="text-accent-purple mb-4" size={40} />
        <h3 className="text-2xl font-bold mb-2">Elite Staff</h3>
        <p className="text-white/60">Guided by a dedicated team of senior leaders and visionaries.</p>
      </div>
      <div className="glass p-8 border-white/20">
        <Trophy className="text-yellow-400 mb-4" size={40} />
        <h3 className="text-2xl font-bold mb-2">Hall of Fame</h3>
        <p className="text-white/60">Celebrating the achievements and impact of our most dedicated members.</p>
      </div>
    </div>
  </div>
);

const IDCheck = () => {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (number.length !== 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/public/id-check/${number}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError('Invalid or Inactive ID');
        setResult(null);
      }
    } catch (e) {
      setError('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 px-6 max-w-3xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-8 uppercase italic">Activist Verification</h2>
      <div className="glass p-10 mb-10">
        <p className="text-white/60 mb-6 uppercase text-sm tracking-widest">Enter 4-Digit Badge Number</p>
        <div className="flex gap-4 justify-center">
          <input
            type="text"
            maxLength={4}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-48 text-4xl text-center bg-white/5 border border-white/20 rounded-xl p-4 focus:border-accent-cyan outline-none transition-all font-mono"
            placeholder="0000"
          />
          <button 
            onClick={handleCheck}
            disabled={loading}
            className="px-8 bg-accent-cyan text-bg-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'VERIFY'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass p-8 neon-cyan flex flex-col md:flex-row items-center gap-8 text-left"
          >
            <img 
              src={result.photoUrl || `https://picsum.photos/seed/${result.fullName}/200/200`} 
              alt={result.fullName}
              className="w-32 h-32 rounded-full border-4 border-accent-cyan shadow-[0_0_15px_rgba(0,242,255,0.5)] object-cover"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan text-[10px] font-bold rounded uppercase">Active ID</span>
                <span className="text-white/40 font-mono">#{result.badgeNumber}</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">{result.fullName}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Department</p>
                  <p className="font-medium">{result.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase">Grade</p>
                  <p className="font-medium">{result.grade}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Staff = () => {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/staff').then(r => r.json()).then(setStaff);
  }, []);

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 uppercase italic text-center">Senior Staff</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {staff.map((member) => (
          <motion.div 
            key={member.id}
            whileHover={{ y: -10 }}
            className="glass p-6 neon-purple text-center"
          >
            <img 
              src={member.photoUrl || `https://picsum.photos/seed/${member.fullName}/200/200`} 
              alt={member.fullName}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-accent-purple object-cover"
            />
            <h3 className="text-xl font-bold">{member.fullName}</h3>
            <p className="text-accent-purple text-sm font-medium uppercase tracking-wider">{member.position}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Wiki = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch('/api/public/wiki').then(r => r.json()).then(data => {
      setArticles(data);
      if (data.length > 0) setSelected(data[0]);
    });
  }, []);

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-64 glass p-6 h-fit shrink-0">
        <h3 className="text-sm font-bold text-white/40 uppercase mb-4 tracking-widest">Knowledge Base</h3>
        <div className="flex flex-col gap-2">
          {articles.map(a => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={cn(
                "text-left p-3 rounded-lg text-sm transition-all",
                selected?.id === a.id ? "bg-accent-cyan/20 text-accent-cyan" : "hover:bg-white/5 text-white/60"
              )}
            >
              {a.title}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 glass p-10 min-h-[600px]">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-accent-cyan text-xs font-bold uppercase tracking-widest mb-2 block">{selected.category}</span>
            <h2 className="text-4xl font-bold mb-8">{selected.title}</h2>
            <div className="prose prose-invert max-w-none text-white/70 leading-relaxed">
              {selected.content}
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-white/20 uppercase tracking-widest">Select an article</div>
        )}
      </div>
    </div>
  );
};

const HR = () => {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/public/vacancies').then(r => r.json()).then(setVacancies);
  }, []);

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 uppercase italic text-center">Career Opportunities</h2>
      <div className="grid gap-6">
        {vacancies.map(v => (
          <div key={v.id} className="glass p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{v.title}</h3>
              <p className="text-white/60">{v.description}</p>
            </div>
            <button 
              onClick={() => setShowForm(v)}
              className="px-6 py-3 bg-accent-cyan text-bg-dark font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all whitespace-nowrap"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
              onClick={() => setShowForm(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass p-10 w-full max-w-lg"
            >
              <h3 className="text-2xl font-bold mb-6">Application for {showForm.title}</h3>
              <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); setShowForm(null); alert('Application Sent!'); }}>
                <input type="text" placeholder="Full Name" className="bg-white/5 border border-white/20 p-3 rounded-lg outline-none focus:border-accent-cyan" required />
                <input type="text" placeholder="Telegram Username (@...)" className="bg-white/5 border border-white/20 p-3 rounded-lg outline-none focus:border-accent-cyan" required />
                <textarea placeholder="Your Motivation" className="bg-white/5 border border-white/20 p-3 rounded-lg outline-none focus:border-accent-cyan h-32" required />
                <button className="w-full py-4 bg-accent-cyan text-bg-dark font-bold rounded-lg">Submit Application</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Admin Dashboard ---

const AdminDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [activeView, setActiveView] = useState('activists');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { id: 'activists', label: 'Activists', roles: ['Chief', 'Senior', 'Admin'], icon: Users },
    { id: 'badges', label: 'Badges', roles: ['Chief', 'Senior', 'Admin'], icon: ShieldCheck },
    { id: 'news', label: 'News', roles: ['Chief', 'Senior'], icon: Newspaper },
    { id: 'wiki', label: 'Wiki', roles: ['Chief', 'Senior'], icon: BookOpen },
    { id: 'vacancies', label: 'Vacancies', roles: ['Chief', 'Senior'], icon: Briefcase },
    { id: 'hof', label: 'Hall of Fame', roles: ['Chief', 'Senior'], icon: Trophy },
    { id: 'apps', label: 'Applications', roles: ['Chief', 'Senior', 'Admin'], icon: ChevronRight },
    { id: 'staff', label: 'Senior Staff', roles: ['Chief'], icon: Users },
    { id: 'settings', label: 'Page Settings', roles: ['Chief'], icon: Layout },
    { id: 'users', label: 'User Management', roles: ['Chief', 'Senior'], icon: ShieldCheck },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${activeView}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 glass border-r border-white/10 p-6 flex flex-col gap-2">
        <div className="mb-8">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Logged in as</p>
          <p className="font-bold text-accent-cyan">{user.username}</p>
          <p className="text-xs text-white/60">{user.role}</p>
        </div>
        {filteredMenu.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg text-sm transition-all",
              activeView === item.id ? "bg-accent-cyan/20 text-accent-cyan" : "hover:bg-white/5 text-white/60"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 p-3 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all"
        >
          <X size={18} />
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold uppercase italic">{activeView.replace('-', ' ')}</h2>
          <button className="px-6 py-2 bg-accent-cyan text-bg-dark font-bold rounded-lg">+ Add New</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-white/20 uppercase tracking-widest">Loading...</div>
        ) : (
          <div className="glass overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-[10px] uppercase text-white/40">ID</th>
                  <th className="p-4 text-[10px] uppercase text-white/40">Details</th>
                  <th className="p-4 text-[10px] uppercase text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono text-xs text-white/40">#{item.id}</td>
                    <td className="p-4">
                      <p className="font-bold">{item.fullName || item.title || item.key || item.username}</p>
                      <p className="text-xs text-white/40">{item.department || item.category || item.status || item.role}</p>
                    </td>
                    <td className="p-4">
                      <button className="text-accent-cyan text-xs font-bold hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowLogin(false);
        setActiveTab('admin');
      } else {
        alert('Invalid credentials');
      }
    } catch (e) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('home');
  };

  if (activeTab === 'admin' && user) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar activeTab="admin" setActiveTab={setActiveTab} />
        <AdminDashboard user={user} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-bg-dark">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="fixed top-6 right-6 z-[60]">
        {user ? (
          <button 
            onClick={() => setActiveTab('admin')}
            className="px-4 py-2 glass text-xs font-bold hover:text-accent-cyan transition-all"
          >
            DASHBOARD
          </button>
        ) : (
          <button 
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 glass text-xs font-bold hover:text-accent-cyan transition-all"
          >
            ADMIN LOGIN
          </button>
        )}
      </div>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <Home />}
            {activeTab === 'id-check' && <IDCheck />}
            {activeTab === 'staff' && <Staff />}
            {activeTab === 'wiki' && <Wiki />}
            {activeTab === 'hr' && <HR />}
            {['hof', 'media', 'partners'].includes(activeTab) && (
              <div className="pt-40 text-center text-white/40 uppercase tracking-widest">
                Section Under Development
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
              onClick={() => setShowLogin(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass p-10 w-full max-w-sm"
            >
              <h3 className="text-2xl font-bold mb-6 uppercase italic">Admin Access</h3>
              <form className="grid gap-4" onSubmit={handleLogin}>
                <input name="username" type="text" placeholder="Username" className="bg-white/5 border border-white/20 p-3 rounded-lg outline-none focus:border-accent-cyan" required />
                <input name="password" type="password" placeholder="Password" className="bg-white/5 border border-white/20 p-3 rounded-lg outline-none focus:border-accent-cyan" required />
                <button className="w-full py-4 bg-accent-cyan text-bg-dark font-bold rounded-lg">Login</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan opacity-50" />
    </div>
  );
}
