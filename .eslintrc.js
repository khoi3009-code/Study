module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'comma-dangle': ['error', 'always-multiline'],
        'space-before-function-paren': ['error', 'always'],
        'keyword-spacing': ['error', { 'before': true, 'after': true }],
        'space-infix-ops': 'error',
        'eol-last': ['error', 'always'],
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': ['error', { 'max': 1 }],
    },
}; 