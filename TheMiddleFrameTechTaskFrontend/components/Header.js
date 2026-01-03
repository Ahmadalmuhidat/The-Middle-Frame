import Link from 'next/link';

export default function Header({ user, activeView, setActiveView, role, onUploadClick }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-black tracking-tight text-slate-900">
            TMF<span className="text-indigo-600">.</span>
          </a>
        </Link>
        <div className="flex items-center space-x-8">
          <div className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              onClick={() => setActiveView('marketplace')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${activeView === 'marketplace' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Explore
            </button>
            {user?.role === 'uploader' && (
              <button
                onClick={() => setActiveView('profile')}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${activeView === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Profile
              </button>
            )}
          </div>
          <nav className="flex items-center space-x-6 text-sm font-bold">
            {user ? (
              <>
                <div className="flex items-center space-x-3 pr-4 border-r border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest">Active</span>
                  <span className="text-slate-900">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <a className="text-slate-500 hover:text-slate-900 transition-colors">Sign In</a>
                </Link>
                <Link href="/register">
                  <a className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all text-[13px]">
                    Join Marketplace
                  </a>
                </Link>
              </>
            )}
          </nav>
          {role === 'photographer' && user && (
            <button
              onClick={onUploadClick}
              className="hidden md:block p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title="Upload Photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
