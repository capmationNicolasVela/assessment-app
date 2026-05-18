import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'API Knowledge Check · Capmation',
  description: 'API Foundations for PMO — Day 5 Assessment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
