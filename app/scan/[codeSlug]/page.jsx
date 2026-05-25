'use client';
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import RegistrationForm from '@/components/RegistrationForm';
import ScanResult from '@/components/ScanResult';
import { api } from '@/utils/api';

function getPosition(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject({ code: 'unsupported' }); return; }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout, maximumAge: 0 });
  });
}

export default function ScanPage({ params }) {
  const { codeSlug } = use(params);
  const [status, setStatus] = useState('loading');
  const [result, setResult] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const wakeTimer = useRef(null);
  const coordsRef = useRef(null);

  useEffect(() => {
    wakeTimer.current = setTimeout(() => setShowWakeNotice(true), 5000);

    api.getCode(codeSlug)
      .then((code) => {
        clearTimeout(wakeTimer.current);
        setShowWakeNotice(false);
        if (!code.active) { setStatus('inactive'); return; }
        startGpsAndScan(code);
      })
      .catch((err) => {
        clearTimeout(wakeTimer.current);
        setShowWakeNotice(false);
        if (err.status === 404) setStatus('not_found');
        else setStatus('error');
      });

    return () => clearTimeout(wakeTimer.current);
  }, [codeSlug]);

  async function startGpsAndScan(code) {
    setStatus('gps');
    let coords = null;
    try {
      const pos = await getPosition();
      coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      const code_ = e.code;
      if (code_ === 1 || e.code === 'unsupported') setGpsError('denied');
      else if (code_ === 3) setGpsError('timeout');
      else setGpsError('unavailable');
      setStatus('gps_error');
      return;
    }
    coordsRef.current = coords;
    proceedWithScan(coords);
  }

  function proceedWithScan(coords) {
    const phone = localStorage.getItem('ias3_phone');
    if (!phone) { setStatus('register'); return; }
    doScan(phone, coords);
  }

  function doScan(phone, coords) {
    setStatus('scanning');
    api.scan({ phone, codeSlug, lat: coords?.lat ?? null, lng: coords?.lng ?? null })
      .then((data) => { setResult(data); setStatus('success'); })
      .catch((err) => {
        if (err.error === 'already_scanned') setStatus('already_scanned');
        else if (err.error === 'too_far') { setDistanceInfo({ distance: err.distance, max: err.max }); setStatus('too_far'); }
        else if (err.error === 'gps_required') { setGpsError('denied'); setStatus('gps_error'); }
        else if (err.error === 'disqualified') setStatus('disqualified');
        else setStatus('error');
      });
  }

  function handleRegisterSuccess(data) { setResult(data); setStatus('success'); }
  function handleRetryGps() { setGpsError(null); setStatus('loading'); startGpsAndScan(null); }

  const stateCard = (title, sub, action) => (
    <div className="card flex flex-col gap-3">
      <h2>{title}</h2>
      {sub && <p className="m-0 text-[14px] text-iroko">{sub}</p>}
      {action}
    </div>
  );

  return (
    <Layout>
      <div className="page-container max-w-[480px] pt-12 pb-12">
        {status === 'loading' && (
          <div className="text-center py-16">
            <p className="loading-text">Checking code...</p>
            {showWakeNotice && <p className="server-wake-notice">Starting up the server — this takes a moment on first load...</p>}
          </div>
        )}

        {status === 'gps' && (
          <div className="text-center py-16">
            <p className="loading-text">Getting your location...</p>
            <p className="text-[13px] text-iroko opacity-65 mt-2">Allow location access when prompted.</p>
          </div>
        )}

        {status === 'gps_error' && (
          <div className="card flex flex-col gap-3">
            <h2>Location required</h2>
            <p className="m-0 text-[14px] text-iroko">
              {gpsError === 'denied'
                ? 'You denied location access. Enable it in your browser settings and try again.'
                : gpsError === 'timeout'
                ? 'Location timed out. Make sure you have a GPS signal and try again.'
                : 'Could not get your location. Try again in the open.'}
            </p>
            <button className="btn btn-primary" onClick={handleRetryGps}>Try again</button>
            <Link href="/" className="btn btn-ghost">Back home</Link>
          </div>
        )}

        {status === 'too_far' && distanceInfo && (
          <div className="card flex flex-col gap-3">
            <h2>Too far away</h2>
            <p className="m-0 text-[14px] text-iroko">
              You are <strong>{distanceInfo.distance} m</strong> from this code. You need to be within {distanceInfo.max} m to scan it.
            </p>
            <p className="m-0 text-[13px] text-iroko opacity-65 italic">Walk closer to the QR code location and scan again.</p>
            <Link href="/" className="btn btn-ghost">Back home</Link>
          </div>
        )}

        {status === 'not_found' && stateCard("Code not found", "This code doesn't exist. Double-check the QR you scanned.", <Link href="/" className="btn btn-ghost">Back home</Link>)}

        {status === 'inactive' && (
          <div className="card flex flex-col gap-3">
            <p className="mono-label text-fired-clay opacity-100">IAS 3.0 · The Hunt</p>
            <h2>Not active yet</h2>
            <p className="m-0">This code is not yet active.</p>
            <p className="text-[13px] text-iroko opacity-65 italic m-0">Stay tuned — it goes live on summit day.</p>
          </div>
        )}

        {status === 'register' && (
          <RegistrationForm
            codeSlug={codeSlug}
            coords={coordsRef.current}
            onSuccess={handleRegisterSuccess}
          />
        )}

        {status === 'scanning' && <div className="text-center py-16"><p className="loading-text">Logging your scan...</p></div>}

        {status === 'already_scanned' && (
          <div className="card flex flex-col gap-3">
            <h2>Already scanned</h2>
            <p className="m-0">You've already scanned this code.</p>
            <p className="text-[13px] text-iroko opacity-65 italic m-0">No points added.</p>
            <Link href="/leaderboard" className="btn btn-primary">See the leaderboard</Link>
          </div>
        )}

        {status === 'success' && result && <ScanResult pointsEarned={result.pointsEarned} totalPoints={result.totalPoints} rank={result.rank} />}

        {status === 'disqualified' && (
          <div className="card flex flex-col gap-3">
            <h2>Account disqualified</h2>
            <p className="m-0 text-[14px] text-iroko">
              This account has been disqualified from The Hunt.
              If you think this is a mistake, contact the IFASA team.
            </p>
          </div>
        )}

        {status === 'error' && stateCard("Something went wrong", "Try scanning the QR code again.", <Link href="/" className="btn btn-ghost">Back home</Link>)}
      </div>
    </Layout>
  );
}
