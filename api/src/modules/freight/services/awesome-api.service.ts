import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { AwesomeApiUsdBrlResponse } from '../interfaces/freight.interface';

@Injectable()
export class AwesomeApiService {
  private readonly logger = new Logger(AwesomeApiService.name);
  private readonly url = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

  async fetchUsdBrlRate(): Promise<number> {
    try {
      const { data } = await axios.get<AwesomeApiUsdBrlResponse>(this.url, {
        timeout: 5000,
      });

      const rate = parseFloat(data.USDBRL.bid);

      if (Number.isNaN(rate)) {
        throw new ServiceUnavailableException('Cotação USD-BRL inválida');
      }

      this.logger.log(`AwesomeAPI: USD-BRL = ${rate}`);

      return rate;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error('Falha ao consultar AwesomeAPI USD-BRL', error);
      throw new ServiceUnavailableException('Serviço AwesomeAPI indisponível');
    }
  }
}
