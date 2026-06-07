/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
