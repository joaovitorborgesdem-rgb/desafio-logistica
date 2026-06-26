import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { ServiceUnavailableException } from '@nestjs/common';
import { AwesomeApiService } from './awesome-api.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AwesomeApiService', () => {
  let service: AwesomeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwesomeApiService],
    }).compile();

    service = module.get(AwesomeApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUsdBrlRate', () => {
    it('deve retornar cotação USD-BRL', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          USDBRL: { bid: '5.1234', ask: '5.1250' },
        },
      });

      const result = await service.fetchUsdBrlRate();

      expect(result).toBe(5.1234);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://economia.awesomeapi.com.br/json/last/USD-BRL',
        expect.any(Object),
      );
    });

    it('deve lançar ServiceUnavailableException para resposta inválida', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { USDBRL: { bid: 'invalid', ask: 'invalid' } },
      });

      await expect(service.fetchUsdBrlRate()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('deve lançar ServiceUnavailableException em falha de rede', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchUsdBrlRate()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
