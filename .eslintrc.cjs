module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
    env: {
        browser: true,
        es2022: true,
        node: true,
    },
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
    ],
    rules: {
        'no-console': 'warn',
        'no-debugger': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': ['error', 'all'],
        '@typescript-eslint/no-unused-vars': ['error'],
        'import/no-unresolved': 'off',
        'import/no-duplicates': 'off',
        // Add more rules as needed
    },
    settings: {
        'import/resolver': {
            node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
            typescript: {},
        },
    },
};
