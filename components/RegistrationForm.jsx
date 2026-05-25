'use client';
import { useState } from 'react';
import { api } from '@/utils/api';

const PHONE_REGEX = /^(070|080|081|090)\d{8}$/;
const LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate'];

export default function RegistrationForm({ codeSlug, coords, onSuccess }) {
  const [form, setForm] = useState({ name: '', department: '', level: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
    try {
      const result = await api.register({ ...form, codeSlug, lat: coords?.lat ?? null, lng: coords?.lng ?? null });
      localStorage.setItem('ias3_phone', form.phone);
      onSuccess(result);
    } catch (err) {
      if (err.error === 'phone_exists') setServerError('This number is already registered. Your scan will be counted next time you scan a code.');
      else if (err.error === 'too_far') setServerError(`You are ${err.distance} m from this code — you need to be within ${err.max} m. Walk closer and try again.`);
      else if (err.error === 'gps_required') setServerError('Location permission is required. Enable it in your browser settings and reload the page.');
      else setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function set(field) { return (e) => setForm((p) => ({ ...p, [field]: e.target.value })); }

  return (
    <div className="card">
      <div className="mb-7">
        <h2 className="mb-2">Register for The Hunt</h2>
        <p className="text-[14px] text-iroko opacity-80 m-0">You only need to do this once.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input id="name" className="form-input" type="text" placeholder="e.g. Tunde Adeyemi" value={form.name} onChange={set('name')} />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="dept">Department</label>
          <input id="dept" className="form-input" type="text" placeholder="e.g. Architecture" value={form.department} onChange={set('department')} />
          {errors.department && <span className="form-error">{errors.department}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="level">Level</label>
          <div className="relative">
            <select id="level" className="form-select" value={form.level} onChange={set('level')}>
              <option value="">Select your level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-iroko opacity-50 text-[12px]">▾</span>
          </div>
          {errors.level && <span className="form-error">{errors.level}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <input id="phone" className="form-input" type="tel" placeholder="e.g. 08012345678" value={form.phone} onChange={set('phone')} />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
        {serverError && <p className="form-error mb-4">{serverError}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Join The Hunt →'}
        </button>
      </form>
    </div>
  );
}
