import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { ApiResponseDto, FilmDto, ScheduleDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll(): Promise<ApiResponseDto<FilmDto>> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  async findSchedule(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<ScheduleDto>> {
    return this.filmsService.findSchedule(id);
  }
}
