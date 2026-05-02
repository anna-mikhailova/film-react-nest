import { Injectable } from '@nestjs/common';
import { ApiResponseDto, FilmDto, ScheduleDto } from './dto/films.dto';
import { FilmsRepository } from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<ApiResponseDto<FilmDto>> {
    const items = await this.filmsRepository.findAll();
    return { total: items.length, items };
  }

  async findSchedule(id: string): Promise<ApiResponseDto<ScheduleDto>> {
    const items = await this.filmsRepository.findSchedule(id);
    return { total: items.length, items };
  }
}
