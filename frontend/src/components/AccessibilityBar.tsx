"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import Script from 'next/script';

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState(100); // percentage

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const increaseFont = () => setFontSize(prev => Math.min(prev + 10, 150));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 10, 80));
  const resetFont = () => setFontSize(100);

  return (
    <>
      <div className="w-full bg-slate-900 text-slate-300 text-xs py-1.5 px-4 md:px-8 flex flex-wrap justify-between items-center border-t-4 border-amber-500 z-50">
        <div className="flex items-center space-x-4">
          <span className="font-semibold tracking-wide text-slate-200 flex items-center">
            <span className="inline-block w-2.5 h-1.5 bg-amber-500 mr-0.5"></span>
            <span className="inline-block w-2.5 h-1.5 bg-white mr-0.5"></span>
            <span className="inline-block w-2.5 h-1.5 bg-emerald-500 mr-1.5"></span>
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline font-mono">Ministry of Home Affairs (MHA)</span>
        </div>
        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          <Link href="#" className="hover:text-amber-500 transition-colors">Screen Reader Access</Link>
          <span className="text-slate-700">|</span>
          <div className="flex space-x-1.5 items-center">
            <button onClick={decreaseFont} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">A-</button>
            <button onClick={resetFont} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">A</button>
            <button onClick={increaseFont} className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 font-bold">A+</button>
          </div>
          <span className="text-slate-700">|</span>
          
          <div id="google_translate_element" className="scale-75 origin-right"></div>
        </div>
      </div>
      
      <Script id="google-translate-script" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              {
                pageLanguage: 'en', 
                includedLanguages: 'hi,ta,te,kn,ml,mr,gu,bn,pa,ur,or,as,en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 
              'google_translate_element'
            );
          }
        `}
      </Script>
      <Script 
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
        strategy="afterInteractive" 
      />
    </>
  );
}
