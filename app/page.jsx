'use client';
import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ScanPicker from '@/components/ScanPicker';

const steps = [
  { num: '01', title: 'Scan', body: "Find a QR code anywhere on campus and scan it with your camera." },
  { num: '02', title: 'Register', body: "Enter your name and department once. That's it." },
  { num: '03', title: 'Climb', body: "Watch your rank rise in real time on the public leaderboard." },
];

export default function Home() {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Layout>
      <div className="page-container max-w-[600px] pt-14 pb-16">
        <section className="mb-[3rem]">
          <p className="mono-label text-fired-clay opacity-100 mb-4 block">IAS 3.0 · Ife Architecture Summit</p>
          <h1 className="mb-5">The Hunt is On.</h1>
          <p className="text-[1.05rem] text-iroko max-w-[480px]">
            QR codes are hidden across OAU's campus. Find them. Scan them. Earn points. The leaderboard updates live.
          </p>
        </section>

        <div className="pattern-strip mb-[3rem]" />

        <section className="mb-[3.5rem]">
          <h2 className="mb-7">How it works</h2>
          <div className="flex flex-col gap-5">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-5 p-5 bg-white border border-[rgba(209,180,155,0.4)] rounded-md">
                <span className="font-mono text-[11px] font-medium text-fired-clay tracking-[0.08em] pt-[3px] min-w-[24px]">{s.num}</span>
                <div className="flex flex-col gap-1">
                  <span className="font-display text-base font-semibold text-obsidian">{s.title}</span>
                  <p className="text-[14px] text-iroko m-0">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start gap-[0.875rem]">
          <Link href="/leaderboard" className="btn btn-primary text-base px-8 py-[14px] w-full max-w-[320px]">
            View Leaderboard →
          </Link>
          <button className="btn btn-secondary text-base px-8 py-[14px] w-full max-w-[320px]" onClick={() => setPickerOpen(true)}>
            Scan a Code →
          </button>
          <p className="text-[13px] text-iroko opacity-60 mt-1 italic font-mono">
            Already registered? Your scans are saved.
          </p>
        </section>
      </div>
      {pickerOpen && <ScanPicker onClose={() => setPickerOpen(false)} />}
    </Layout>
  );
}
