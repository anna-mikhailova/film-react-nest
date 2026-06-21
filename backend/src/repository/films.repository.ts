import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectRepository(Film) private readonly filmRepo: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepo.find();
    return films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));
  }

  async findSchedule(id: string): Promise<ScheduleDto[]> {
    const film = await this.filmRepo.findOne({
      where: { id },
      relations: ['schedules'],
    });
    if (!film) return [];
    return film.schedules.map((s) => ({
      id: s.id,
      daytime: s.daytime,
      hall: String(s.hall),
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken,
    }));
  }

  async bookTicket(
    filmId: string,
    sessionId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const seatKey = `${row}:${seat}`;
    const result = await this.scheduleRepo
      .createQueryBuilder()
      .update(Schedule)
      .set({
        taken: () =>
          `CASE WHEN taken = '' THEN :seatKey ELSE taken || ',' || :seatKey END`,
      })
      .where(
        `id = :sessionId AND "filmId" = :filmId AND (',' || taken || ',') NOT LIKE ('%,' || :seatKey || ',%')`,
      )
      .setParameters({ seatKey, sessionId, filmId })
      .execute();
    return (result.affected ?? 0) > 0;
  }
}
