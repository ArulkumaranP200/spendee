/** @type {const} */
const themeColors = {
  primary: { light: '#1e40af', dark: '#3b82f6' }, // Deep blue for finance
  background: { light: '#ffffff', dark: '#0f172a' },
  surface: { light: '#f8fafc', dark: '#1e293b' },
  foreground: { light: '#0f172a', dark: '#f1f5f9' },
  muted: { light: '#64748b', dark: '#94a3b8' },
  border: { light: '#e2e8f0', dark: '#334155' },
  success: { light: '#16a34a', dark: '#22c55e' }, // Green for income/paid
  warning: { light: '#ea580c', dark: '#fb923c' }, // Orange for warnings
  error: { light: '#dc2626', dark: '#ef4444' }, // Red for expenses/unpaid
  accent: { light: '#7c3aed', dark: '#a78bfa' }, // Purple for exclusions
};

module.exports = { themeColors };
