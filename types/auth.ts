export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  age: number | null;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  age: number | null;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  age: number | string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
}
