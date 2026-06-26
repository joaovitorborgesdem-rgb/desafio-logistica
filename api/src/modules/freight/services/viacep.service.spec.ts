import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { ServiceUnavailableException } from '@nestjs/common';
import { ViaCepService } from './viacep.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ViaCepService', () => {
  let service: ViaCepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ViaCepService],
    }).compile();

    service = module.get(ViaCepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchLocation', () => {
    it('deve retornar cidade e estado do CEP', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          cep: '01310-100',
          localidade: 'São Paulo',
          uf: 'SP',
        },
      });

      const result = await service.fetchLocation('01310100');

      expect(result).toEqual({
        cep: '01310100',
        city: 'São Paulo',
        state: 'SP',
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01310100/json/',
        expect.any(Object),
      );
    });

    it('deve lançar ServiceUnavailableException para CEP inválido', async () => {
      mockedAxios.get.mockResolvedValue({ data: { erro: true } });

      await expect(service.fetchLocation('00000000')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('deve lançar ServiceUnavailableException em falha de rede', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchLocation('01310100')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
