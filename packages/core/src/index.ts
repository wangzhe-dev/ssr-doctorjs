/**
 * @ssr-doctor/core
 *
 * Core detection engine for SSR Doctor.
 * Zero dependencies - pure detection logic that can be shared
 * between CLI, GitHub Action, and other tools.
 */

export {
  detectSSRIssues,
  getIssueStats,
  type SSRIssue,
  type DetectOptions,
} from './analyzer.js';
