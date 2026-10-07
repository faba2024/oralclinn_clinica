/** Paleta dos gráficos: grafite e champagne como protagonistas, tons quentes de apoio. */
export const CHART_COLORS = {
  primary: "#202020",
  gold: "#B69A67",
  champagne: "#D6C39C",
  sand: "#E7E2D8",
  sage: "#6E8B74",
  slate: "#4F6A80",
  clay: "#9A6B5B",
  grid: "#EEEAE2",
  axis: "#8F8B84",
};

export const SERIES_PALETTE = ["#202020", "#B69A67", "#6E8B74", "#4F6A80", "#9A6B5B", "#D6C39C", "#7A6F8E", "#8F8B84"];

export const axisProps = {
  stroke: CHART_COLORS.axis,
  fontSize: 11.5,
  tickLine: false,
  axisLine: false,
} as const;
