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
      // Advisory, not an error. This React Compiler rule cannot distinguish a
      // cascading-render bug from the two patterns this app legitimately needs
      // on an SSR boundary: the `isMounted` hydration gate, and browser-API
      // detection (serviceWorker/PushManager) that is only knowable on the
      // client. Both REQUIRE setState in an effect — moving them into a lazy
      // useState initializer reads `window`/`localStorage` during SSR and
      // breaks hydration. Kept at 'warn' so genuinely new violations still
      // surface in review instead of being silenced with 'off'.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'public/sw.js'],
  },
];

export default config;
