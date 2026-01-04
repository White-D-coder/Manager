/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    experimental: {
        turbopack: {
            // Explicitly set the root to the current directory to avoid
            // confusion with parent directory lockfiles (e.g. ~/package-lock.json)
            root: __dirname,
        },
    },
    webpack: (config) => {
        // Fallback for webpack if jsconfig isn't picked up
        config.resolve.alias['@'] = __dirname;
        return config;
    },
};

export default nextConfig;
