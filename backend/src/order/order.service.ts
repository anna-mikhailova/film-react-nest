import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto, OrderResponseItemDto } from './dto/order.dto';
import { ApiResponseDto } from '../films/dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async create(
    dto: CreateOrderDto,
  ): Promise<ApiResponseDto<OrderResponseItemDto>> {
    const seenSeats = new Set<string>();
    for (const ticket of dto.tickets) {
      const key = `${ticket.film}:${ticket.session}:${ticket.row}:${ticket.seat}`;
      if (seenSeats.has(key)) {
        throw new BadRequestException(
          `Duplicate seat ${ticket.row}:${ticket.seat} in request`,
        );
      }
      seenSeats.add(key);
    }

    const items: OrderResponseItemDto[] = [];

    for (const ticket of dto.tickets) {
      const booked = await this.filmsRepository.bookTicket(
        ticket.film,
        ticket.session,
        ticket.row,
        ticket.seat,
      );

      if (!booked) {
        throw new BadRequestException(
          `Seat ${ticket.row}:${ticket.seat} in session ${ticket.session} is already taken`,
        );
      }

      items.push({ ...ticket, id: crypto.randomUUID() });
    }

    return { total: items.length, items };
  }
}
