/**
 * LFNM System Versioning
 * Single source of truth for application version.
 */

export const SYSTEM_VERSION = {
    major: 1,
    minor: 197, // Increment here
    timestamp: '060120260939', // Format: DDMMYYYYHHMM
    full: '1.197',
    label: 'alpha',

    getDisplayString: () => `versão alpha 1.197 060120260939`,
};

export default SYSTEM_VERSION;
