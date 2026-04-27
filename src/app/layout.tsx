import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LandRegistryProvider } from '@/contexts/LandRegistryContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TerraLedger - Land Registry Platform',
  description: 'Secure, map-based land and property records for registrars and property owners.',
  keywords: 'land registry, property records, geofencing, openstreetmap, terraledger',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
