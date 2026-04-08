/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.pokemontcg.io",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.scrydex.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:3000/api/:path*", // Asumiendo que tu backend corre en el puerto 3000
            },
        ];
    },
};

export default nextConfig;
