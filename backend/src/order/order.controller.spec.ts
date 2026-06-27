import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: { create: jest.Mock };

  const dto: CreateOrderDto = {
    email: 'user@example.com',
    phone: '+79991234567',
    tickets: [
      {
        film: 'film-1',
        session: 'session-1',
        daytime: '2026-06-28T18:00:00.000Z',
        row: 1,
        seat: 1,
        price: 100,
      },
    ],
  };

  beforeEach(async () => {
    service = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: service }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('create()', () => {
    it('вызывает orderService.create() с DTO из запроса', async () => {
      service.create.mockResolvedValue({ total: 0, items: [] });

      await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('возвращает значение, которое вернул orderService.create()', async () => {
      const result = {
        total: 1,
        items: [{ ...dto.tickets[0], id: 'order-1' }],
      };
      service.create.mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toBe(result);
    });

    it('пробрасывает BadRequestException при дублирующемся месте в запросе', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Duplicate seat 1:1 in request'),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('пробрасывает BadRequestException, если место уже занято', async () => {
      service.create.mockRejectedValue(
        new BadRequestException(
          'Seat 1:1 in session session-1 is already taken',
        ),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
