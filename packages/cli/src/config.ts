import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface SSRDoctorConfig {
  /**
   * Extends another configuration
   */
  extends?: string;

  /**
   * Rules configuration
   */
  rules?: {
    'browser-api'?: {
      severity?: 'error' | 'warning' | 'off';
      allowedAPIs?: string[];
      ignorePatterns?: string[];
    };
    'dynamic-ssr'?: {
      severity?: 'error' | 'warning' | 'off';
      autoFix?: boolean;
    };
    'hydration-risk'?: {
      severity?: 'error' | 'warning' | 'off';
    };
  };

  /**
   * Glob patterns to ignore
   */
  ignore?: string[];

  /**
   * Output format
   */
  format?: 'text' | 'json' | 'markdown' | 'sarif';

  /**
   * Output file path
   */
  output?: string;

  /**
   * Strict mode (fail on warnings)
   */
  strict?: boolean;

  /**
   * Verbose output
   */
  verbose?: boolean;
}

/**
 * Default configuration
 */
export const defaultConfig: SSRDoctorConfig = {
  rules: {
    'browser-api': {
      severity: 'error',
      allowedAPIs: [],
      ignorePatterns: [],
    },
    'dynamic-ssr': {
      severity: 'warning',
      autoFix: false,
    },
    'hydration-risk': {
      severity: 'error',
    },
  },
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
  format: 'text',
  strict: false,
  verbose: false,
};

/**
 * Preset configurations
 */
export const presets: Record<string, SSRDoctorConfig> = {
  recommended: {
    ...defaultConfig,
  },
  strict: {
    ...defaultConfig,
    strict: true,
    rules: {
      'browser-api': {
        severity: 'error',
        allowedAPIs: [],
      },
      'dynamic-ssr': {
        severity: 'error',
        autoFix: false,
      },
      'hydration-risk': {
        severity: 'error',
      },
    },
  },
  lenient: {
    ...defaultConfig,
    strict: false,
    rules: {
      'browser-api': {
        severity: 'warning',
        allowedAPIs: [],
      },
      'dynamic-ssr': {
        severity: 'warning',
        autoFix: true,
      },
      'hydration-risk': {
        severity: 'warning',
      },
    },
  },
};

/**
 * Load configuration from file
 */
export function loadConfig(configPath?: string): SSRDoctorConfig {
  let config: SSRDoctorConfig = { ...defaultConfig };

  // Try to find config file
  const configFiles = [
    configPath,
    '.ssrdoctorrc.json',
    '.ssrdoctorrc',
    'ssrdoctor.config.json',
  ].filter(Boolean);

  for (const file of configFiles) {
    const fullPath = resolve(process.cwd(), file!);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const fileConfig = JSON.parse(content);

        // Handle extends
        if (fileConfig.extends) {
          const baseConfig = loadPreset(fileConfig.extends);
          config = mergeConfig(config, baseConfig);
        }

        // Merge with file config
        config = mergeConfig(config, fileConfig);
        break;
      } catch (error) {
        console.error(`Error loading config from ${fullPath}:`, error);
      }
    }
  }

  // Try package.json
  const pkgPath = resolve(process.cwd(), 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.ssrDoctor || pkg['ssr-doctor']) {
        config = mergeConfig(config, pkg.ssrDoctor || pkg['ssr-doctor']);
      }
    } catch (error) {
      // Ignore package.json errors
    }
  }

  return config;
}

/**
 * Load preset configuration
 */
function loadPreset(name: string): SSRDoctorConfig {
  // Remove @ prefix if present
  const presetName = name.replace(/^@ssr-doctor\/config-/, '');

  if (presets[presetName]) {
    return presets[presetName];
  }

  console.warn(`Unknown preset: ${name}, using default config`);
  return defaultConfig;
}

/**
 * Merge two configurations
 */
function mergeConfig(base: SSRDoctorConfig, override: SSRDoctorConfig): SSRDoctorConfig {
  return {
    ...base,
    ...override,
    rules: {
      ...base.rules,
      ...override.rules,
    },
    ignore: [
      ...(base.ignore || []),
      ...(override.ignore || []),
    ],
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: SSRDoctorConfig): string[] {
  const errors: string[] = [];

  // Validate format
  if (config.format && !['text', 'json', 'markdown', 'sarif'].includes(config.format)) {
    errors.push(`Invalid format: ${config.format}. Must be one of: text, json, markdown, sarif`);
  }

  // Validate rules
  if (config.rules) {
    for (const [ruleName, ruleConfig] of Object.entries(config.rules)) {
      if (!['browser-api', 'dynamic-ssr', 'hydration-risk'].includes(ruleName)) {
        errors.push(`Unknown rule: ${ruleName}`);
      }

      if (ruleConfig?.severity && !['error', 'warning', 'off'].includes(ruleConfig.severity)) {
        errors.push(`Invalid severity for ${ruleName}: ${ruleConfig.severity}`);
      }
    }
  }

  return errors;
}
