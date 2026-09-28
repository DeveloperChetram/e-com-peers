export class CreateAddressDto {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export class UpdateAddressDto {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
