/**
 * LFNM System Versioning
 * Single source of truth for application version.
 */

export const SYSTEM_VERSION = {
    major: 0,
    minor: 0,
    build: 1,
    timestamp: '100120261835',
    full: '0.0.3',
    label: 'reset-milestone',

    getDisplayString: () => `V 0.0.3 (Build 01)`,
};

export default SYSTEM_VERSION;
