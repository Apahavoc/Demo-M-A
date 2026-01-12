import { Adjustment, Client, WorkingCapitalState } from './types';

export const INITIAL_REPORTED_EBITDA = 5000000;

export const INITIAL_ADJUSTMENTS: Adjustment[] = [
  { id: '1', description: 'Indemnizaciones Extraordinarias', value: 250000 },
  { id: '2', description: 'Reparaciones No Recurrentes', value: 120000 },
  { id: '3', description: 'Ajuste de Alquileres (Mercado)', value: -85000 },
  { id: '4', description: 'Gastos Personales Socios', value: 150000 },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Cliente Alpha (Principal)', share: 35 },
  { id: 'c2', name: 'Grupo Beta', share: 15 },
  { id: 'c3', name: 'Industrias Gamma', share: 10 },
  { id: 'c4', name: 'Distribuciones Delta', share: 8 },
  { id: 'c5', name: 'Logística Epsilon', share: 5 },
];

export const INITIAL_WC_STATE: WorkingCapitalState = {
  dso: 65, // High collection days
  dpo: 45, // Payment days
  dio: 30, // Inventory days
  revenue: 25000000,
  grossMargin: 40 // 40% margin implies 60% COGS
};