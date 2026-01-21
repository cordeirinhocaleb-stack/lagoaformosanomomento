export const TEXT_BLOCK_STYLES = `
/* GLOBAL LIST STYLES */
[role="article"] ul { list-style-type: disc !important; padding-left: 1.5rem !important; display: block !important; margin: 10px 0; }
[role="article"] ol { list-style-type: decimal !important; padding-left: 1.5rem !important; display: block !important; margin: 10px 0; }
[role="article"] li { display: list-item !important; margin-bottom: 0.6rem; outline: none; min-height: 1.2em; text-align: left; }

/* Estilos de Espaçamento */
.list-spacing-compact li { margin-bottom: 0.2rem !important; }
.list-spacing-normal li { margin-bottom: 0.6rem !important; }
.list-spacing-relaxed li { margin-bottom: 1.2rem !important; }

/* Estilos de Tamanho */
.list-size-sm li { font-size: 0.875rem !important; }
.list-size-normal li { font-size: 1rem !important; }
.list-size-lg li { font-size: 1.25rem !important; }

/* Cores de Marcadores (Bullets/Numbers) */
.list-marker-red li::marker { color: #dc2626 !important; }
.list-marker-blue li::marker { color: #2563eb !important; }
.list-marker-green li::marker { color: #10b981 !important; }
.list-marker-purple li::marker { color: #9333ea !important; }
.list-marker-orange li::marker { color: #f97316 !important; }
.list-marker-pink li::marker { color: #ec4899 !important; }
.list-marker-default li::marker { color: inherit !important; }

/* ROW STYLES (NOVO) */
.list-row-divided li { border-bottom: 1px solid #f4f4f5; padding-bottom: 0.5em; padding-top: 0.5em; }
.list-row-divided li:last-child { border-bottom: none; }

.list-row-striped li:nth-child(odd) { background-color: #f9fafb; padding: 0.5em; border-radius: 6px; }
.list-row-striped li { padding-left: 0.5em; padding-right: 0.5em; }

.list-row-boxed li { background-color: #f9fafb; padding: 0.75em; border: 1px solid #f4f4f5; border-radius: 8px; margin-bottom: 0.5em !important; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }

/* Variantes Específicas */
.list-bullets-square li { list-style-type: square !important; }

/* Numbered Steps Customizados */
.list-numbered-steps ol { list-style-type: none !important; counter-reset: lfnm-step; padding-left: 0 !important; }
.list-numbered-steps li { 
    counter-increment: lfnm-step; 
    position: relative; 
    padding-left: 3rem !important; 
    list-style-type: none !important;
    display: block !important;
}

.list-numbered-steps li::before { 
content: counter(lfnm-step); 
position: absolute; left: 0; top: 0; 
width: 1.8rem; height: 1.8rem; 
background: #000; color: #fff; 
border-radius: 50%; display: flex; 
align-items: center; justify-content: center; 
font-size: 10px; font-weight: 900; 
z-index: 10;
}

.list-numbered-steps.marker-style-outline li::before {
    background: transparent !important;
    border: 2px solid #000;
    color: #000;
}

.list-numbered-steps.marker-style-simple li::before {
    background: transparent !important;
    border: none;
    color: #000;
    font-size: 14px;
    width: auto;
    justify-content: flex-start;
    content: counter(lfnm-step) ".";
}

/* Steps com Cores Override */
.list-marker-red.list-numbered-steps li::before { background: #dc2626; border-color: #dc2626; color: #fff; }
.list-marker-red.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #dc2626; }
.list-marker-red.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #dc2626; }

.list-marker-blue.list-numbered-steps li::before { background: #2563eb; border-color: #2563eb; color: #fff; }
.list-marker-blue.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #2563eb; }
.list-marker-blue.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #2563eb; }

.list-marker-green.list-numbered-steps li::before { background: #10b981; border-color: #10b981; color: #fff; }
.list-marker-green.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #10b981; }
.list-marker-green.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #10b981; }

.list-marker-purple.list-numbered-steps li::before { background: #9333ea; border-color: #9333ea; color: #fff; }
.list-marker-purple.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #9333ea; }
.list-marker-purple.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #9333ea; }

.list-marker-orange.list-numbered-steps li::before { background: #f97316; border-color: #f97316; color: #fff; }
.list-marker-orange.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #f97316; }
.list-marker-orange.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #f97316; }

.list-marker-pink.list-numbered-steps li::before { background: #ec4899; border-color: #ec4899; color: #fff; }
.list-marker-pink.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #ec4899; }
.list-marker-pink.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #ec4899; }

[contenteditable="true"]:empty:before { content: attr(data-placeholder); color: #cbd5e1; pointer-events: none; }
`;
