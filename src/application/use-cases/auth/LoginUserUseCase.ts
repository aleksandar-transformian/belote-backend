import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/Email';
import { LoginUserDto, AuthResponseDto } from '@application/dtos/UserDtos';
import { JwtService } from '@infrastructure/auth/JwtService';
import { logger } from '@shared/utils/logger';

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Find user by email
    const email = Email.create(dto.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(dto.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.update(user);

    logger.info('User logged in successfully', { userId: user.getId().getValue() });

    // Generate tokens
    const tokenPayload = {
      userId: user.getId().getValue(),
      username: user.getUsername(),
      email: user.getEmail().getValue(),
    };

    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.getId().getValue(),
        username: user.getUsername(),
        email: user.getEmail().getValue(),
        eloRating: user.getEloRating(),
        totalGames: user.getTotalGames(),
        wins: user.getWins(),
        losses: user.getLosses(),
        winRate: user.getWinRate(),
        createdAt: user.getCreatedAt().toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }
}
