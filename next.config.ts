import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WebpackConfig {
  resolve: {
    fallback: Record<string, boolean>;
    alias: Record<string, string>;
    modules: string[];
  };
  module: {
    rules: Array<{
      test: RegExp;
      type: string;
      use?: string | Array<{ loader: string; options: Record<string, unknown> }>;
    }>;
  };
  externals: { [key: string]: string }[];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config: WebpackConfig,
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
        inspector: false,
        readline: false,
        dns: false,
        module: false,
        async_hooks: false,
        'playwright-core/lib/vite/recorder': false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }

    // Adding custom module rules
    config.module.rules.push(
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // Correcting type for font files
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader', // Wrapping the loader in an object with options
            options: {
              minimize: true, // Option to minimize HTML
            },
          },
        ],
        type: 'asset/resource', // Ensuring HTML files are correctly processed
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack', // Wrapping the loader in an object with options
            options: {
              icon: true, // Example option for SVGR (you can add more)
            },
          },
        ],
        type: 'asset/resource', // Ensure SVG files are processed as assets
      },
      {
        test: /\/playwright-logo\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'static/images/',
              publicPath: '/_next/static/images/',
            },
          },
        ],
        type: 'asset/resource', // Correct type for image files
      },
      {
        test: /\/assets\/.*\.(js|css)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'static/playwright/',
              publicPath: '/_next/static/playwright/',
            },
          },
        ],
        type: 'asset/resource', // Handle JS and CSS files as assets
      },
      {
        test: /playwright-core/,
        use: 'null-loader',
        type: 'asset/resource', // Optional null-loader for playwright-core
      }
    );

    // Handle Playwright and Bull as external modules
    config.externals.push(
      {
        'playwright-core': 'playwright-core',
        playwright: 'playwright',
        bull: 'bull',
        electron: 'electron',
      }
    );

    // Define aliases for specific paths
    config.resolve.alias['/playwright-logo.svg'] = path.resolve(__dirname, 'node_modules/playwright-core/lib/vite/recorder/playwright-logo.svg');
    config.resolve.modules.push(path.resolve('./'));

    return config;
  },

  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Additional experimental features
  experimental: {
    serverComponentsExternalPackages: ['playwright-core', 'playwright', 'bull', 'electron'],
    outputFileTracingRoot: undefined,
    runtime: 'edge',
  },

  // Standalone output configuration
  output: 'standalone',
};

export default nextConfig;
