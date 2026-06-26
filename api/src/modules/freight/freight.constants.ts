export const FREIGHT_SIMULATION_QUEUE = 'freight-simulation';

export const FREIGHT_OPTIONS = [
  { option: 'ECONOMICA', label: 'Econômica', ratePerKg: 2.5, deliveryDays: 5 },
  { option: 'EXPRESSA', label: 'Expressa', ratePerKg: 4.0, deliveryDays: 2 },
  { option: 'PREMIUM', label: 'Premium', ratePerKg: 6.5, deliveryDays: 1 },
] as const;

export const CUBIC_WEIGHT_DIVISOR = 6000;
export const AD_VALOREM_RATE = 0.003;
