import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { ApiResponseDto, FilmDto, ScheduleDto } from './dto/films.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: { findAll: jest.Mock; findSchedule: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn(), findSchedule: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [{ provide: FilmsService, useValue: service }],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
  });

  describe('findAll()', () => {
    it('вызывает filmsService.findAll() без аргументов', async () => {
      service.findAll.mockResolvedValue({ total: 0, items: [] });

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
    });

    it('возвращает значение, которое вернул filmsService.findAll()', async () => {
      const result: ApiResponseDto<FilmDto> = {
        total: 1,
        items: [{ id: '1' } as FilmDto],
      };
      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toBe(result);
    });
  });

  describe('findSchedule()', () => {
    it('передаёт id из параметра маршрута в filmsService.findSchedule()', async () => {
      service.findSchedule.mockResolvedValue({ total: 0, items: [] });

      await controller.findSchedule('film-123');

      expect(service.findSchedule).toHaveBeenCalledWith('film-123');
    });

    it('возвращает значение, которое вернул filmsService.findSchedule()', async () => {
      const result: ApiResponseDto<ScheduleDto> = {
        total: 1,
        items: [{ id: 's1' } as ScheduleDto],
      };
      service.findSchedule.mockResolvedValue(result);

      await expect(controller.findSchedule('film-123')).resolves.toBe(result);
    });

    it('пробрасывает отказ от filmsService.findSchedule() наружу', async () => {
      service.findSchedule.mockRejectedValue(new Error('not found'));

      await expect(controller.findSchedule('bad-id')).rejects.toThrow(
        'not found',
      );
    });
  });
});
