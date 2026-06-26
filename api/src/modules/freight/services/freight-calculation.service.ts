import { Injectable, Logger } from '@nestjs/common';
import { AD_VALOREM_RATE, CUBIC_WEIGHT_DIVISOR, FREIGHT_OPTIONS } from '../freight.constants';
import { FreightQuote, SimulateFreightInput } from '../interfaces/freight.interface';

@Injectable()
export class FreightCalculationService {
  private readonly logger = new Logger(FreightCalculationService.name);

  calculateCubicWeightKg(lengthCm: number, widthCm: number, heightCm: number): number {
    return (lengthCm * widthCm * heightCm) / CUBIC_WEIGHT_DIVISOR;
  }

  calculateTaxedWeightKg(weightKg: number, cubicWeightKg: number): number {
    return Math.max(weightKg, cubicWeightKg);
  }

  calculateAdValorem(cargoValue: number): number {
    return cargoValue * AD_VALOREM_RATE;
  }

  calculateQuotes(input: SimulateFreightInput): FreightQuote[] {
    const cubicWeightKg = this.calculateCubicWeightKg(
      input.lengthCm,
      input.widthCm,
      input.heightCm,
    );
    const taxedWeightKg = this.calculateTaxedWeightKg(input.weightKg, cubicWeightKg);
    const adValorem = this.calculateAdValorem(input.cargoValue);

    const quotes = FREIGHT_OPTIONS.map((option) => ({
      option: option.option,
      label: option.label,
      ratePerKg: option.ratePerKg,
      deliveryDays: option.deliveryDays,
      cubicWeightKg: this.round(cubicWeightKg, 3),
      taxedWeightKg: this.round(taxedWeightKg, 3),
      adValorem: this.round(adValorem, 2),
      freightTotal: this.round(taxedWeightKg * option.ratePerKg + adValorem, 2),
    }));

    this.logger.log(
      `Cotações calculadas: peso taxado ${this.round(taxedWeightKg, 3)}kg, ${quotes.length} opções`,
    );

    return quotes;
  }

  private round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
}
