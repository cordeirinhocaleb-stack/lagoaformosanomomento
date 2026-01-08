// SISTEMA DE VERSIONAMENTO
// 1. DISPLAY_VERSION (SemVer): Mudamos apenas quando lançamos um "pacote" de atualizações para o usuário (ex: 30 correções = +1 patch).
// 2. BUILD_NUMBER (Dev): Incrementamos a cada edição/commit interno para controle.
// Formato Visual: "0.1.4 (Build 220)"

export const DISPLAY_VERSION = '0.0.1';
export const BUILD_NUMBER = 1;
export const BUILD_REF = '070120262316'; // Ref: DDMMYYYYHHMM

export const APP_VERSION = `${DISPLAY_VERSION} (Build ${BUILD_NUMBER})`;
