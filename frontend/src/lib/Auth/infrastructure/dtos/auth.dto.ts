// API Response DTOs - matching the backend structure
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO string from API
  updatedAt: string; // ISO string from API
}

export interface AuthResponseDto {
  message: string;
  user: UserResponseDto;
}

export interface RefreshResponseDto {
  message: string;
}

export interface LogoutResponseDto {
  message: string;
}

// API Request DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

// Error Response DTO
export interface ApiErrorDto {
  message: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
