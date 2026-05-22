"use client";
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SOSFloatingButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after brief delay so it animates in
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Link
      href="/sos"
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      title="Emergency SOS — Share Live Location"
    >
      {/* Outer pulse rings */}
      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
      <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 delay-300" style={{ animationDelay: '0.5s' }} />
      
      {/* Button */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-full shadow-2xl shadow-red-500/60 flex flex-col items-center justify-center gap-0.5 border-2 border-red-400 active:scale-95 transition-transform cursor-pointer">
        <AlertTriangle className="w-6 h-6" />
        <span className="text-[9px] font-black tracking-widest">SOS</span>
      </div>
    </Link>
  );
}
