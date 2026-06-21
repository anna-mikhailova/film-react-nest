import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from '../films/schemas/film.schema';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

@Injectable()
export class FilmsRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find({}, { schedule: 0 }).exec();
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
    const film = await this.filmModel.findOne({ id }).exec();
    if (!film) return [];
    return film.schedule.map((s) => ({
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
    const result = await this.filmModel
      .findOneAndUpdate(
        {
          id: filmId,
          schedule: { $elemMatch: { id: sessionId, taken: { $ne: seatKey } } },
        },
        { $push: { 'schedule.$.taken': seatKey } },
      )
      .exec();
    return result !== null;
  }
}
