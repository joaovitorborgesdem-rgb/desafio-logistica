export interface FreightQuote {
  option: string;
  label: string;
  ratePerKg: number;
  deliveryDays: number;
  cubicWeightKg: number;
  taxedWeightKg: number;
  adValorem: number;
  freightTotal: number;
}

export interface FreightLocationInfo {
  cep: string;
  city?: string;
  state?: string;
}

export interface FreightSimulationResults {
  origin: FreightLocationInfo;
  destination: FreightLocationInfo;
  usdBrlRate: number;
  quotes: FreightQuote[];
}

export interface SimulateFreightInput {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  cargoValue: number;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface AwesomeApiUsdBrlResponse {
  USDBRL: {
    bid: string;
    ask: string;
  };
}
