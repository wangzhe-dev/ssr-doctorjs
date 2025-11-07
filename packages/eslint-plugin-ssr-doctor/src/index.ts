import noWindowUsage from './rules/no-window-usage.js';
import noDocumentUsage from './rules/no-document-usage.js';
import noLocalStorageUsage from './rules/no-localstorage-usage.js';

const plugin = {
  meta: {
    name: '@ssr-doctor/eslint-plugin',
    version: '0.1.0',
  },
  rules: {
    'no-window-usage': noWindowUsage,
    'no-document-usage': noDocumentUsage,
    'no-localstorage-usage': noLocalStorageUsage,
  },
  configs: {
    recommended: {
      plugins: ['@ssr-doctor'],
      rules: {
        '@ssr-doctor/no-window-usage': 'error',
        '@ssr-doctor/no-document-usage': 'error',
        '@ssr-doctor/no-localstorage-usage': 'error',
      },
    },
  },
};

export default plugin;
