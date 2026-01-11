module.exports = {
    root: true,
    ignorePatterns: ['dist', 'build', 'node_modules', 'android'],
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
    plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    rules: {
        'no-console': 'warn',
        'no-debugger': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': ['error', 'all'],
        '@typescript-eslint/no-unused-vars': ['error', {
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_',
            'ignoreRestSiblings': true
        }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'import/no-unresolved': 'off',
        'import/no-duplicates': 'off',
        'react/react-in-jsx-scope': 'off',
        // Add more rules as needed
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
};
