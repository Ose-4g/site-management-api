export interface LoginDTO {
  userType: EntityType;
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

export const entityTypes = <const>['Company', 'Manager'];
export type EntityType = typeof entityTypes[number];

export interface Session {
  userType: EntityType;
  id: string;
}
