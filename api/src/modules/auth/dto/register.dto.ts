import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '@/common/enums/user-role.enum';

export class RegisterDto {
  @IsUUID()
  tenantId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
