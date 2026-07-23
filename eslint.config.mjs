// ESLint 9 flat config. The previous file held legacy-eslintrc JSON inside a
// .mjs module — a syntax error, so lint never ran. eslint-config-next 16
// ships native flat presets; this restores the intended core-web-vitals setup.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'public/sw.js'],
  },
];

export default config;
