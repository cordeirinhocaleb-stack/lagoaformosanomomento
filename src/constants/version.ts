/**
 * LFNM System Versioning
 * Single source of truth for application version.
 */

export const SYSTEM_VERSION = {
    major: 0,
    minor: 0,
    build: 6,
    timestamp: '120120262230',
    full: '0.0.6',
    label: 'media-gallery-cloud',

    getDisplayString: () => `V 0.0.6 (Build 02)`,
};

export default SYSTEM_VERSION;
