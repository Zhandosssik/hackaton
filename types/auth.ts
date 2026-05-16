export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
}
