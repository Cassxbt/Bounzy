import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Polyfill Node.js globals for browser (required by @zama-fhe/relayer-sdk)
            config.resolve.fallback = {
                ...config.resolve.fallback,
                buffer: require.resolve("buffer/"),
                process: require.resolve("process/browser"),
                crypto: false,
                stream: false,
                fs: false,
                path: false,
            };

            // Provide global polyfills
            const webpack = require("webpack");
            config.plugins.push(
                new webpack.ProvidePlugin({
                    Buffer: ["buffer", "Buffer"],
                    process: "process/browser",
                }),
                new webpack.DefinePlugin({
                    global: "globalThis",
                })
            );
        }
        return config;
    },
};

export default nextConfig;
