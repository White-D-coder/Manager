/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {

    webpack: (config) => {
        // Fallback for webpack if jsconfig isn't picked up
        config.resolve.alias['@'] = __dirname;
        return config;
    },
};

export default nextConfig;
