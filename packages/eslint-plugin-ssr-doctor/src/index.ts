// Legacy rules (kept for backward compatibility)
import noWindowUsage from './rules/no-window-usage.js';
import noDocumentUsage from './rules/no-document-usage.js';
import noLocalStorageUsage from './rules/no-localstorage-usage.js';

// New MVP rules
import noBrowserApiInSsr from './rules/no-browser-api-in-ssr.js';
import dynamicSsrFlag from './rules/dynamic-ssr-flag.js';
import hydrationRiskUseeffect from './rules/hydration-risk-useeffect.js';

const plugin = {
  meta: {
    name: '@ssr-doctor/eslint-plugin',
    version: '0.1.0',
  },
  rules: {
    // Legacy rules
    'no-window-usage': noWindowUsage,
    'no-document-usage': noDocumentUsage,
    'no-localstorage-usage': noLocalStorageUsage,

    // New MVP rules
    'no-browser-api-in-ssr': noBrowserApiInSsr,
    'dynamic-ssr-flag': dynamicSsrFlag,
    'hydration-risk-useeffect': hydrationRiskUseeffect,
  },
  configs: {
    recommended: {
      plugins: ['@ssr-doctor'],
      rules: {
        // MVP rules (primary)
        '@ssr-doctor/no-browser-api-in-ssr': 'error',
        '@ssr-doctor/dynamic-ssr-flag': 'warn',
        '@ssr-doctor/hydration-risk-useeffect': 'error',
      },
    },
    legacy: {
      plugins: ['@ssr-doctor'],
      rules: {
        // Legacy rules
        '@ssr-doctor/no-window-usage': 'error',
        '@ssr-doctor/no-document-usage': 'error',
        '@ssr-doctor/no-localstorage-usage': 'error',
      },
    },
    all: {
      plugins: ['@ssr-doctor'],
      rules: {
        // All rules enabled
        '@ssr-doctor/no-browser-api-in-ssr': 'error',
        '@ssr-doctor/dynamic-ssr-flag': 'warn',
        '@ssr-doctor/hydration-risk-useeffect': 'error',
        '@ssr-doctor/no-window-usage': 'error',
        '@ssr-doctor/no-document-usage': 'error',
        '@ssr-doctor/no-localstorage-usage': 'error',
      },
    },
  },
};

export default plugin;
