/**
 * LFNM System Versioning
 * Single source of truth for application version.
 */

export const SYSTEM_VERSION = {
    major: 0,
    minor: 0,
    build: 5,
    timestamp: '110120262330',
    full: '0.0.5',
    label: 'navigation-guard',

    getDisplayString: () => `V 0.0.5 (Build 10)`,
};

export default SYSTEM_VERSION;
