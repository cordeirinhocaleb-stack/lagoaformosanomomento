module.exports = [
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            import: require('eslint-plugin-import'),
        },
        rules: {
            'no-console': 'warn',
            'no-debugger': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            '@typescript-eslint/no-unused-vars': ['error'],
            'import/no-unresolved': 'off',
            'import/no-duplicates': 'off',
        },
    },
];
