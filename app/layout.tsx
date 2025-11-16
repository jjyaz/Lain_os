import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WIRED CONSCIOUSNESS UPLOAD PROTOCOL',
  description: 'Present Day. Present Time. Upload your consciousness to the Wired.',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  );
}
