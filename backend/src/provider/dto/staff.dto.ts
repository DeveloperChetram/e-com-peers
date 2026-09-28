export class CreateStaffDto {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export class UpdateStaffDto {
  name?: string;
  role?: string;
  isActive?: boolean;
}
