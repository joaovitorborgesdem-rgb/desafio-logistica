import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @IsUUID()
  tenantId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
