import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { apiInstance } from '../utils/api'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (data) => {
    try {
      const response = await apiInstance.post('auth/login', {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, error: 'Network error' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-indigo-100">
      <Head>
        <title>Sign In | TMF Marketplace</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <a className="flex justify-center text-3xl font-black tracking-tighter text-slate-900 mb-8">
            TMF<span className="text-indigo-600">.</span>
          </a>
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Access your photography dashboard
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-10 shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          <form className="space-y-8" action="#" method="POST">
            <div>
              <label htmlFor="email" className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between ml-1 mb-2">
                <label htmlFor="password" className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Password
                </label>
                <div className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                  Forgot?
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  setError('');
                  try {
                    const res = await login(formData);
                    if (res.success) {
                      localStorage.setItem('token', res.token);
                      localStorage.setItem('user', JSON.stringify(res.user));
                      window.location.href = '/';
                    } else {
                      setError(res.error || 'Invalid credentials');
                    }
                  } catch (err) {
                    setError('Unable to connect to the server');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className={`w-full flex justify-center py-4.5 px-4 border border-transparent rounded-xl shadow-lg shadow-slate-200 text-sm font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="mt-10 pt-10 border-t border-slate-50">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              New to the platform?{' '}
              <Link href="/register">
                <a className="text-indigo-600 hover:text-indigo-500 transition-colors ml-1">Create an account</a>
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          The Middle Frame Marketplace
        </p>
      </div>
    </div>
  )
}
