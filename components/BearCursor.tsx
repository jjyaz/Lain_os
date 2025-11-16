'use client';

import { useEffect, useState } from 'react';

export function BearCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.7) {
        setPosition({ x: e.clientX, y: e.clientY });
        setVisible(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setVisible(false), 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 text-4xl opacity-40"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s ease-out',
      }}
    >
      🧸
    </div>
  );
}
