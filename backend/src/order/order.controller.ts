import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseItemDto } from './dto/order.dto';
import { ApiResponseDto } from '../films/dto/films.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() dto: CreateOrderDto,
  ): Promise<ApiResponseDto<OrderResponseItemDto>> {
    return this.orderService.create(dto);
  }
}
