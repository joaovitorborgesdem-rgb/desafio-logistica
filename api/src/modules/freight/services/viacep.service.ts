import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { FreightLocationInfo, ViaCepResponse } from '../interfaces/freight.interface';

@Injectable()
export class ViaCepService {
  private readonly logger = new Logger(ViaCepService.name);
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async fetchLocation(cep: string): Promise<FreightLocationInfo> {
    const normalizedCep = cep.replace(/\D/g, '');

    try {
      const { data } = await axios.get<ViaCepResponse>(
        `${this.baseUrl}/${normalizedCep}/json/`,
        { timeout: 5000 },
      );

      if (data.erro) {
        throw new ServiceUnavailableException(`CEP ${normalizedCep} não encontrado`);
      }

      this.logger.log(`ViaCEP: ${normalizedCep} → ${data.localidade}/${data.uf}`);

      return {
        cep: normalizedCep,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(`Falha ao consultar ViaCEP para ${normalizedCep}`, error);
      throw new ServiceUnavailableException('Serviço ViaCEP indisponível');
    }
  }
}
