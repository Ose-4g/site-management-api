export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignUpUserDTO extends LoginDTO {
  name: string;
  phoneNumber: string;
}

export interface VerifyUserDTO {
  email: string;
  code: string;
}

export interface ResetPasswordDTO extends VerifyUserDTO {
  password: string;
}

export type EntityType = 'Company' | 'Manager';
