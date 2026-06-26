import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SimulateFreightDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'originCep deve conter 8 dígitos numéricos' })
  originCep!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'destinationCep deve conter 8 dígitos numéricos' })
  destinationCep!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  weightKg!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  lengthCm!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  widthCm!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  heightCm!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  cargoValue!: number;
}
