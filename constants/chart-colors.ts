/**
 * Categorical chart palette — fixed hue order, validated for CVD-safe
 * adjacent-pair separation and contrast against this app's light/dark
 * surfaces. Always assign in this order; never cycle or re-sort by value.
 */
export const CHART_CATEGORICAL_LIGHT = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const;

export const CHART_CATEGORICAL_DARK = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
] as const;

export function getChartCategoricalPalette(scheme: 'light' | 'dark'): readonly string[] {
  return scheme === 'dark' ? CHART_CATEGORICAL_DARK : CHART_CATEGORICAL_LIGHT;
}
