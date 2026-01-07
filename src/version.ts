export const DISPLAY_VERSION = '0.1.3';
export const BUILD_NUMBER = 219;
export const BUILD_REF = '060120262205'; // Ref: DDMMYYYYHHMM

// Exporta o formato solicitado: "0.1.0 (Build 216)"
// Os componentes adicionam o prefixo "LFNM V." ou "v" conforme o contexto visual.
export const APP_VERSION = `${DISPLAY_VERSION} (Build ${BUILD_NUMBER})`;
