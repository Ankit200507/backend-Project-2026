import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LandRegistryProvider } from '@/contexts/LandRegistryContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TerraLedger — Cryptographic Land Registry',
  description: 'Immutable, map-based land and property records powered by cryptographic verification and OpenStreetMaps.',
  keywords: 'land registry, property records, geofencing, openstreetmap, blockchain, terraledger',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <LandRegistryProvider>
            <AppShell>{children}</AppShell>
          </LandRegistryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
