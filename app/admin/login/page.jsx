'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { auth } from '@/utils/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.login(form);
      auth.setToken(data.token);
      router.push('/admin');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-harmattan">
      <div className="card w-full max-w-[380px]">
        <div className="flex flex-col items-center gap-1 mb-7">
          <span className="font-display font-bold text-[22px] text-obsidian">IAS 3.0</span>
          <span className="font-mono text-[10px] text-iroko uppercase tracking-[0.1em] opacity-65">Admin Access</span>
        </div>
        <h2 className="mb-6">Sign in</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" className="form-input" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          </div>
          {error && <p className="form-error mb-4">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
