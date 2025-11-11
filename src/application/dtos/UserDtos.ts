export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  eloRating: number;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  createdAt: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
