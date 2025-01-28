/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config: {
      resolve: { fallback: Record<string, boolean | string> };
      externals: { [key: string]: string }[];
    },
    { isServer }: { isServer: boolean }
  ) => {
    if (!isServer) {
      // Handle Node.js module fallbacks for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        electron: false,
        'playwright-core': false,
        playwright: false,
        bull: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        http: false,
        https: false,
        url: false,
        util: false,
        zlib: false,
      };
    }
    module.exports = {
      output: 'standalone',
      experimental: {
        outputFileTracingRoot: undefined,
        runtime: 'edge',
      },
    }
    
    // Handle Playwright and Bull as external modules
    config.externals.push({
      'playwright-core': 'playwright-core',
      playwright: 'playwright',
      bull: 'bull',
      electron: 'electron',
    });

    return config;
  },
  // Other Next.js configurations
  experimental: {
    serverComponentsExternalPackages: ['playwright-core', 'playwright', 'bull', 'electron'],
  },
};

export default nextConfig;