import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppControllerProvider } from '@/providers/AppControllerProvider';
import Script from 'next/script';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: 'Lagoa Formosa no Momento',
    description: 'Informação de verdade, com a credibilidade de quem conhece cada canto da nossa terra.',
    icons: {
        icon: [
            {
                url: 'https://res.cloudinary.com/dqrxppg5b/image/upload/c_fill,w_32,h_32,g_center/v1768817794/lfnm_cms/geral/gustavo/gustavo_2026-01-19_geral_4187.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                url: 'https://res.cloudinary.com/dqrxppg5b/image/upload/c_fill,w_192,h_192,g_center/v1768817794/lfnm_cms/geral/gustavo/gustavo_2026-01-19_geral_4187.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
        apple: 'https://res.cloudinary.com/dqrxppg5b/image/upload/c_fill,w_180,h_180,g_center/v1768817794/lfnm_cms/geral/gustavo/gustavo_2026-01-19_geral_4187.png',
    },
    openGraph: {
        title: 'Lagoa Formosa no Momento',
        description: 'Informação de verdade, com a credibilidade de quem conhece cada canto da nossa terra.',
        images: ['https://res.cloudinary.com/dqrxppg5b/image/upload/v1768776131/lfnm_cms/geral/gustavo/gustavo_2026-01-18_geral_2570.jpg'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                {/* Preconnect para otimizar handshake com servidores de fonte e CDN */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Fontes otimizadas com display=swap e subset=latin (LEGACY RESTORED) */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;family=Merriweather:wght@300;400;700;900&amp;family=Caveat:wght@400;700&amp;display=swap&amp;subset=latin"
                    rel="stylesheet"
                />

                {/* Font Awesome */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            </head>
            <body className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 font-sans" suppressHydrationWarning>
                <AppControllerProvider>
                    {children}
                </AppControllerProvider>
                {/* <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /> */} {/* DESABILITADO */}
            </body>
        </html>
    );
}
