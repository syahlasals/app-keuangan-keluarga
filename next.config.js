const path = require('path');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
  // Fix for webpack cache issue
  buildExcludes: [/middleware-manifest\.json$/],
  cacheStartUrl: false,
  dynamicStartUrl: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Add webpack configuration to fix cache issue
  webpack: (config, { isServer, nextRuntime }) => {
    // Clear webpack cache on development to avoid the hasStartTime error
    if (!isServer && process.env.NODE_ENV === 'development') {
      config.cache = {
        type: 'filesystem',
        version: 'development',
        cacheDirectory: path.join(__dirname, '.next/cache/webpack/client-development'),
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);