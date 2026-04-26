import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile leaflet and react-leaflet for SSR compatibility
  transpilePackages: ['leaflet', 'react-leaflet', 'leaflet-draw'],
};

export default nextConfig;
