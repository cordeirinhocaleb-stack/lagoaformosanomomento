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
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                {/* Preconnect para otimizar handshake com servidores de fonte e CDN */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Fontes otimizadas com display=swap e subset=latin (LEGACY RESTORED) */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@300;400;700;900&family=Caveat:wght@400;700&display=swap&subset=latin"
                    rel="stylesheet"
                />

                {/* Font Awesome */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            </head>
            <body className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 font-sans" suppressHydrationWarning>
                <AppControllerProvider>
                    {children}
                </AppControllerProvider>
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
            </body>
        </html>
    );
}

