/**
 * SecureImage Component
 * Renders images with blur applied via canvas to prevent removal via DevTools
 */

import React, { useEffect, useRef, useState } from 'react';

interface SecureImageProps {
    src: string;
    blur: number;
    className?: string;
    style?: React.CSSProperties;
    alt?: string;
}

const SecureImage: React.FC<SecureImageProps> = ({ src, blur, className, style, alt }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (blur <= 0) {
            setIsLoaded(true);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {return;}

        const ctx = canvas.getContext('2d');
        if (!ctx) {return;}

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Apply blur using canvas filter
            ctx.filter = `blur(${blur}px)`;

            // Draw image with blur
            ctx.drawImage(img, 0, 0, img.width, img.height);

            setIsLoaded(true);
        };

        img.onerror = () => {
            console.error('Failed to load image for blur protection');
            setIsLoaded(true);
        };

        img.src = src;
    }, [src, blur]);

    // If blur is 0 or very small, just use regular img tag
    if (blur <= 0) {
        return <img src={src} className={className} style={style} alt={alt || ''} />;
    }

    // Render canvas with blurred image
    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                ...style,
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s'
            }}
        />
    );
};

export default SecureImage;
