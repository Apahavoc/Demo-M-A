export interface Adjustment {
  id: string;
  description: string;
  value: number;
  isSimulation?: boolean; // To identify auto-generated impacts
}

export interface WaterfallDataPoint {
  name: string;
  value: number;
  start: number;
  fill: string;
  displayValue: number;
  isTotal: boolean;
}

export interface Client {
  id: string;
  name: string;
  share: number; // percentage 0-100
}

export interface WorkingCapitalState {
  dso: number; // Days Sales Outstanding
  dpo: number; // Days Payable Outstanding
  dio: number; // Days Inventory Outstanding
  revenue: number;
  grossMargin: number; // percentage 0-100 (to calc COGS)
}

export enum ChartColor {
  POSITIVE = '#10b981', // Emerald 500
  NEGATIVE = '#ef4444', // Red 500
  TOTAL = '#002855',    // Dark Blue
  HIGHLIGHT = '#f97316', // Industrial Orange
  NEUTRAL = '#94a3b8'   // Slate 400
}