module.exports = {
  extends: [
    './base.js',
  ],
  rules: {
    // Règles spécifiques pour Node.js
    'no-process-exit': 'error',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-require': 'error',
    'node/no-unpublished-require': 'off',
    'node/no-deprecated-api': 'warn',
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    'promise/param-names': 'error',
    'promise/always-return': 'warn',
    'promise/catch-or-return': 'warn',
  },
  plugins: [
    'node',
    'promise',
  ],
};