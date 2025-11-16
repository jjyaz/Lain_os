'use client';

import { useEffect, useRef, useState } from 'react';

export function LainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLain, setShowLain] = useState(false);
  const [lainMessage, setLainMessage] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawStatic = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 10;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 15;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const animate = () => {
      drawStatic();
      requestAnimationFrame(animate);
    };

    animate();

    const lainInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setShowLain(true);
        setTimeout(() => setShowLain(false), 1500);
      }
    }, 5000);

    const messageInterval = setInterval(() => {
      if (Math.random() > 0.98) {
        setLainMessage(true);
        setTimeout(() => setLainMessage(false), 3000);
      }
    }, 10000);

    return () => {
      clearInterval(lainInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
      />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="scanlines" />
        <div className="crt-flicker" />
      </div>
      {showLain && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-9xl font-bold opacity-20 pointer-events-none z-50 animate-pulse glitch-text">
          LAIN
        </div>
      )}
      {lainMessage && (
        <div className="fixed inset-0 bg-red-900 flex items-center justify-center z-50 pointer-events-none animate-pulse">
          <div className="text-white text-6xl font-bold tracking-widest glitch-text">
            LET&apos;S ALL LOVE LAIN
          </div>
        </div>
      )}
    </>
  );
}
