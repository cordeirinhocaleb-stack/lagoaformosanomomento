
/**
 * PROCESSADOR DE MARCA D'ÁGUA FÍSICA (Build 44)
 * Padrão Jornalístico LFNM - Design High-End
 */
export const applyPhysicalWatermark = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(file);

                // Dimensões nativas para fidelidade total
                const targetWidth = img.naturalWidth;
                const targetHeight = img.naturalHeight;
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // 1. Fundo de segurança (Zinc-950 para áreas transparentes)
                ctx.fillStyle = '#09090b';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 2. Renderização da Imagem Base
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // 3. MOLDURA EDITORIAL VERMELHA (Espessura proporcional)
                const frameThickness = Math.max(3, Math.floor(targetHeight * 0.01));
                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = frameThickness;
                ctx.strokeRect(frameThickness / 2, frameThickness / 2, targetWidth - frameThickness, targetHeight - frameThickness);

                // 4. ELEMENTOS DE IDENTIDADE (Build 44)
                const barWidth = targetWidth * 0.65;
                const barHeight = targetHeight * 0.08;
                const barX = targetWidth - barWidth;
                const barY = targetHeight - barHeight - (targetHeight * 0.10);

                // --- TAG ANO (Top Right) ---
                const tagHeight = barHeight * 0.8;
                const tagWidth = tagHeight * 1.5;
                const tagX = targetWidth - tagWidth - (frameThickness * 1.5);
                const tagY = frameThickness * 1.5;

                ctx.fillStyle = '#dc2626';
                ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
                ctx.font = `900 ${tagHeight * 0.6}px Inter, sans-serif`;
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('2026', tagX + (tagWidth / 2), tagY + (tagHeight / 2));

                // --- BARRA URL (Bottom Right) ---
                const bgGradient = ctx.createLinearGradient(barX, barY, targetWidth, barY);
                bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                bgGradient.addColorStop(0.3, 'rgba(220, 38, 38, 0.85)');
                bgGradient.addColorStop(1, 'rgba(220, 38, 38, 1)');

                ctx.fillStyle = bgGradient;
                ctx.fillRect(barX, barY, barWidth, barHeight);

                // Texto do site
                const fontSize = Math.max(12, barHeight * 0.45);
                ctx.font = `900 ${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText('LAGOAFORMOSANOMOMENTO.COM.BR', targetWidth - (barHeight * 0.5), barY + (barHeight / 2));

                // 5. Finalização (JPEG 92% para balanço qualidade/peso)
                canvas.toBlob((blob) => {
                    if (blob) {
                        const watermarkedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(watermarkedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.92);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};
