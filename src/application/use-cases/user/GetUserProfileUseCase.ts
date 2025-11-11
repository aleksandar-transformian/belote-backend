import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserId } from '@domain/value-objects/UserId';
import { UserResponseDto } from '@application/dtos/UserDtos';

export class GetUserProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const id = UserId.create(userId);
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

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
