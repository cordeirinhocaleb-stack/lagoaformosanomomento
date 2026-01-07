export const DISPLAY_VERSION = '0.1.2';
export const BUILD_NUMBER = 218;
export const BUILD_REF = '060120262155'; // Ref: DDMMYYYYHHMM

// Exporta o formato solicitado: "0.1.0 (Build 216)"
// Os componentes adicionam o prefixo "LFNM V." ou "v" conforme o contexto visual.
export const APP_VERSION = `${DISPLAY_VERSION} (Build ${BUILD_NUMBER})`;
