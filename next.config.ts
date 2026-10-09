import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // App é majoritariamente dinâmico (dashboards autenticados por usuário/sessão),
  // então desativamos Cache Components/PPR em vez de anotar cada rota.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
