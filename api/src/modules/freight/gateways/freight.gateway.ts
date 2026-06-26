import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FreightSimulationResults } from '../interfaces/freight.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export class FreightGateway implements OnGatewayInit {
  private readonly logger = new Logger(FreightGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.logger.log('Gateway Socket.io inicializado');
  }

  emitSimulationDone(simulationId: string, results: FreightSimulationResults): void {
    this.server.emit('simulation:done', {
      simulation_id: simulationId,
      results,
    });

    this.logger.log(`Evento simulation:done emitido para ${simulationId}`);
  }
}
