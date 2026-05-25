'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/utils/api';

const CameraScanner = dynamic(() => import('@/components/CameraScanner'), { ssr: false });

const PHONE_REGEX = /^(070|080|081|090)\d{8}$/;
const LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate'];

export default function Register() {
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', level: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(null);
  const [phoneExists, setPhoneExists] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => { if (localStorage.getItem('ias3_phone')) setAlreadyRegistered(true); }, []);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.level) e.level = 'Level is required';
    if (!PHONE_REGEX.test(form.phone)) e.phone = 'Enter a valid Nigerian number (e.g. 08012345678)';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setServerError('');
    setPhoneExists(false);
    try {
      const result = await api.register({ ...form, codeSlug: null });
      localStorage.setItem('ias3_phone', form.phone);
      setSuccess({ name: result.name || form.name.trim() });
    } catch (err) {
      if (err.error === 'phone_exists') setPhoneExists(true);
      else setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function set(field) { return (e) => setForm((p) => ({ ...p, [field]: e.target.value })); }

  const stateCard = (title, body, actions) => (
    <Layout>
      <div className="page-container max-w-[480px] pt-12 pb-12">
        <div className="card flex flex-col gap-3">
          <p className="mono-label text-fired-clay opacity-100">IAS 3.0 · The Hunt</p>
          <h2>{title}</h2>
          {body && <p>{body}</p>}
          <div className="flex flex-col gap-3 mt-2">{actions}</div>
        </div>
      </div>
      {showScanner && <CameraScanner onClose={() => setShowScanner(false)} />}
    </Layout>
  );

  if (alreadyRegistered) return stateCard("You're already registered.", "Welcome back. Keep scanning QR codes across campus to earn more points.", [
    <button key="scan" className="btn btn-primary" onClick={() => setShowScanner(true)}>Scan a Code →</button>,
    <Link key="lb" href="/leaderboard" className="btn btn-secondary">View Leaderboard →</Link>,
  ]);

  if (success) return stateCard("You're in.", `Welcome to The Hunt, ${success.name}. Start scanning QR codes across campus to earn points.`, [
    <button key="scan" className="btn btn-primary" onClick={() => setShowScanner(true)}>Scan a Code →</button>,
    <Link key="lb" href="/leaderboard" className="btn btn-secondary">View Leaderboard →</Link>,
  ]);

  return (
    <Layout>
      <div className="page-container max-w-[480px] pt-12 pb-12">
        <div className="mb-7">
          <p className="mono-label text-fired-clay opacity-100 mb-3 block">IAS 3.0 · The Hunt</p>
          <h2 className="mb-2">Join The Hunt</h2>
          <p className="text-[14px] text-iroko opacity-80 m-0">Register once and every QR code you scan will be tracked automatically.</p>
        </div>
        <div className="card">
          {phoneExists ? (
            <div className="flex flex-col gap-4">
              <p className="m-0 text-[14px]">This number is already registered.</p>
              <Link href="/leaderboard" className="btn btn-secondary w-full">View Leaderboard →</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="rn">Full Name</label>
                <input id="rn" className="form-input" type="text" placeholder="e.g. Tunde Adeyemi" value={form.name} onChange={set('name')} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rd">Department</label>
                <input id="rd" className="form-input" type="text" placeholder="e.g. Architecture" value={form.department} onChange={set('department')} />
                {errors.department && <span className="form-error">{errors.department}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rl">Level</label>
                <div className="relative">
                  <select id="rl" className="form-select" value={form.level} onChange={set('level')}>
                    <option value="">Select your level</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <span className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-iroko opacity-50 text-[12px]">▾</span>
                </div>
                {errors.level && <span className="form-error">{errors.level}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rp">Phone Number</label>
                <input id="rp" className="form-input" type="tel" placeholder="e.g. 08012345678" value={form.phone} onChange={set('phone')} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
              {serverError && <p className="form-error mb-4">{serverError}</p>}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Join The Hunt →'}
              </button>
            </form>
          )}
        </div>
      </div>
      {showScanner && <CameraScanner onClose={() => setShowScanner(false)} />}
    </Layout>
  );
}
