import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FilmDocument = HydratedDocument<Film>;

@Schema({ _id: false })
export class Schedule {
  @Prop() id: string;
  @Prop() daytime: string;
  @Prop() hall: number;
  @Prop() rows: number;
  @Prop() seats: number;
  @Prop() price: number;
  @Prop({ type: [String], default: [] }) taken: string[];
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

@Schema({ collection: 'films' })
export class Film {
  @Prop() id: string;
  @Prop() rating: number;
  @Prop() director: string;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop() title: string;
  @Prop() about: string;
  @Prop() description: string;
  @Prop() image: string;
  @Prop() cover: string;
  @Prop({ type: [ScheduleSchema], default: [] }) schedule: Schedule[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);
