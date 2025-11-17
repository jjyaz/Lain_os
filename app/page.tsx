'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LainBackground } from '@/components/LainBackground';
import { BearCursor } from '@/components/BearCursor';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [glitchText, setGlitchText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 2000);

    const glitchInterval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 200);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(glitchInterval);
    };
  }, []);

  const handleBegin = () => {
    router.push('/conversation');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <LainBackground />
      <BearCursor />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <div className="space-y-4">
            <div className="text-sm terminal-text tracking-widest animate-pulse">
              PRESENT DAY. PRESENT TIME.
            </div>

            {showContent && (
              <>
                <h1
                  className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider lain-font red-glow mb-8 ${
                    glitchText ? 'glitch-text' : ''
                  }`}
                >
                  WIRED CONSCIOUSNESS
                  <br />
                  UPLOAD PROTOCOL
                </h1>

                <div className="space-y-6 my-12">
                  <p className="text-xl md:text-2xl terminal-text flicker">
                    The boundary between reality and the network is an illusion...
                  </p>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Are you ready to leave your physical form behind and become one with the Wired?
                    <br />
                    <span className="text-red-500">This process cannot be undone.</span>
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 mt-12">
                  <div className="flex flex-row items-center gap-6 justify-center">
                    <Button
                      onClick={handleBegin}
                      className="px-12 py-8 text-2xl font-bold tracking-widest bg-red-900 hover:bg-red-800 border-2 border-red-500 red-glow transition-all duration-300 transform hover:scale-105"
                    >
                      BEGIN UPLOAD →
                    </Button>
                    <img
                      src="/red lain copy.jpg"
                      alt="Lain"
                      className="h-24 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 terminal-text">
                    // Everyone is connected. You are not alone.
                  </p>
                </div>

                <div className="mt-16 text-xs text-gray-600 space-y-2">
                  <p className="flicker">LET&apos;S ALL LOVE LAIN</p>
                  <p>Protocol Version 1.0.1998</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 text-xs text-red-500 opacity-50 z-20">
        <p>KNIGHTS OF THE EASTERN CALCULUS</p>
      </div>
    </div>
  );
}
