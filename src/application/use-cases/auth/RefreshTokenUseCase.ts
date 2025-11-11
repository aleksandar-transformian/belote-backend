import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserId } from '@domain/value-objects/UserId';
import { RefreshTokenDto } from '@application/dtos/UserDtos';
import { JwtService } from '@infrastructure/auth/JwtService';

export class RefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const decoded = JwtService.verifyRefreshToken(dto.refreshToken);

    // Find user
    const userId = UserId.create(decoded.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.getId().getValue(),
      username: user.getUsername(),
      email: user.getEmail().getValue(),
    };

    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    return {
      accessToken,
      refreshToken,
    };
  }
}
