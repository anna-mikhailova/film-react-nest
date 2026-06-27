import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TicketDto {
  @IsUUID()
  film: string;

  @IsUUID()
  session: string;

  @IsString()
  @IsNotEmpty()
  daytime: string;

  @IsInt()
  @IsPositive()
  row: number;

  @IsInt()
  @IsPositive()
  seat: number;

  @IsInt()
  @IsPositive()
  price: number;
}

export class CreateOrderDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}

export class OrderResponseItemDto extends TicketDto {
  id: string;
}
