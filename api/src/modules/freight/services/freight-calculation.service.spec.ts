import { Test, TestingModule } from '@nestjs/testing';
import { FreightCalculationService } from './freight-calculation.service';

describe('FreightCalculationService', () => {
  let service: FreightCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreightCalculationService],
    }).compile();

    service = module.get(FreightCalculationService);
  });

  describe('calculateCubicWeightKg', () => {
    it('deve calcular peso cúbico corretamente', () => {
      const result = service.calculateCubicWeightKg(30, 20, 15);

      expect(result).toBe(1.5);
    });
  });

  describe('calculateTaxedWeightKg', () => {
    it('deve usar o maior entre peso real e cúbico', () => {
      expect(service.calculateTaxedWeightKg(10, 1.5)).toBe(10);
      expect(service.calculateTaxedWeightKg(1, 5)).toBe(5);
    });
  });

  describe('calculateAdValorem', () => {
    it('deve calcular 0.3% do valor da carga', () => {
      expect(service.calculateAdValorem(1000)).toBe(3);
    });
  });

  describe('calculateQuotes', () => {
    it('deve retornar 3 opções de frete com totais corretos', () => {
      const quotes = service.calculateQuotes({
        weightKg: 10,
        lengthCm: 30,
        widthCm: 20,
        heightCm: 15,
        cargoValue: 1000,
      });

      expect(quotes).toHaveLength(3);
      expect(quotes[0].option).toBe('ECONOMICA');
      expect(quotes[0].taxedWeightKg).toBe(10);
      expect(quotes[0].adValorem).toBe(3);
      expect(quotes[0].freightTotal).toBe(28);
      expect(quotes[1].freightTotal).toBe(43);
      expect(quotes[2].freightTotal).toBe(68);
    });

    it('deve usar peso cúbico quando maior que peso real', () => {
      const quotes = service.calculateQuotes({
        weightKg: 1,
        lengthCm: 60,
        widthCm: 40,
        heightCm: 30,
        cargoValue: 500,
      });

      expect(quotes[0].taxedWeightKg).toBe(12);
      expect(quotes[0].freightTotal).toBe(31.5);
    });
  });
});
