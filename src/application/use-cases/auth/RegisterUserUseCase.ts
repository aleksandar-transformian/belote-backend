import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';
import { RegisterUserDto, AuthResponseDto } from '@application/dtos/UserDtos';
import { JwtService } from '@infrastructure/auth/JwtService';
import { logger } from '@shared/utils/logger';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    // Validate input
    this.validate(dto);

    // Check if email already exists
    const email = Email.create(dto.email);
    const emailExists = await this.userRepository.exists(email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const usernameExists = await this.userRepository.findByUsername(dto.username);
    if (usernameExists) {
      throw new Error('Username already taken');
    }

    // Hash password
    const password = await Password.create(dto.password);

    // Create user entity
    const user = User.create({
      username: dto.username,
      email: dto.email,
      password: password.getValue(),
    });

    // Save to database
    const savedUser = await this.userRepository.save(user);

    logger.info('User registered successfully', { userId: savedUser.getId().getValue() });

    // Generate tokens
    const tokenPayload = {
      userId: savedUser.getId().getValue(),
      username: savedUser.getUsername(),
      email: savedUser.getEmail().getValue(),
    };

    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    return {
      user: this.mapToResponse(savedUser),
      accessToken,
      refreshToken,
    };
  }

  private validate(dto: RegisterUserDto): void {
    if (!dto.username || dto.username.length < 3 || dto.username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(dto.username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }

    if (!dto.email) {
      throw new Error('Email is required');
    }

    if (!dto.password) {
      throw new Error('Password is required');
    }
  }

  private mapToResponse(user: User) {
    return {
      id: user.getId().getValue(),
      username: user.getUsername(),
      email: user.getEmail().getValue(),
      eloRating: user.getEloRating(),
      totalGames: user.getTotalGames(),
      wins: user.getWins(),
      losses: user.getLosses(),
      winRate: user.getWinRate(),
      createdAt: user.getCreatedAt().toISOString(),
    };
  }
}
