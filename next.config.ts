import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Static export desabilitado para desenvolvimento local (ATIVADO PARA PROD)
    output: 'export',

    // Desabilitar otimização de imagens para compatibilidade
    images: {
        unoptimized: true,
    },

    // Trailing slash para melhor compatibilidade
    trailingSlash: true,

    // Diretório de saída padrão (.next)
    // distDir: 'out',

    // Configuração de paths
    reactStrictMode: true,

    // Ignorar ESLint durante build (warnings não devem bloquear)
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignorar erros de TS durante build (necessário devido a wegho-agentes)
    typescript: {
        ignoreBuildErrors: true,
    },

    // Variáveis de ambiente públicas
    env: {
        APP_VERSION: process.env.npm_package_version || '0.1.0',
    },

    // Nota: headers() não funciona com output: 'export'
    // Configure headers no servidor web (Apache/Nginx) se necessário
};

export default nextConfig;
