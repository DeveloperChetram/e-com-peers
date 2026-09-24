import { RegisterUserDto } from "./register-user.dto";

export class RegisterProviderDto extends RegisterUserDto {
  businessName: string;
  description: string;
}