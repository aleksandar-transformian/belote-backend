import { Pool } from 'pg';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User, UserProps } from '@domain/entities/User';
import { UserId } from '@domain/value-objects/UserId';
import { Email } from '@domain/value-objects/Email';
import { logger } from '@shared/utils/logger';

export class UserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async save(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, username, email, password_hash, elo_rating, total_games, wins, losses, created_at, last_login)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      user.getId().getValue(),
      user.getUsername(),
      user.getEmail().getValue(),
      user.getPassword().getValue(),
      user.getEloRating(),
      user.getTotalGames(),
      user.getWins(),
      user.getLosses(),
      user.getCreatedAt(),
      user.getLastLogin(),
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapToEntity(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'users_username_key') {
          throw new Error('Username already exists');
        }
      }
      logger.error('Error saving user', { error: error.message });
      throw new Error('Failed to save user');
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email.getValue()]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await this.pool.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToEntity(result.rows[0]);
  }

  async update(user: User): Promise<User> {
    const query = `
      UPDATE users
      SET username = $2, email = $3, password_hash = $4, elo_rating = $5,
          total_games = $6, wins = $7, losses = $8, last_login = $9
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      user.getId().getValue(),
      user.getUsername(),
      user.getEmail().getValue(),
      user.getPassword().getValue(),
      user.getEloRating(),
      user.getTotalGames(),
      user.getWins(),
      user.getLosses(),
      user.getLastLogin(),
    ];

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      return this.mapToEntity(result.rows[0]);
    } catch (error: any) {
      logger.error('Error updating user', { error: error.message });
      throw new Error('Failed to update user');
    }
  }

  async delete(id: UserId): Promise<void> {
    const query = 'DELETE FROM users WHERE id = $1';
    await this.pool.query(query, [id.getValue()]);
  }

  async exists(email: Email): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await this.pool.query(query, [email.getValue()]);
    return result.rows[0].exists;
  }

  private mapToEntity(row: any): User {
    const userProps: UserProps = {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password_hash,
      eloRating: row.elo_rating,
      totalGames: row.total_games,
      wins: row.wins,
      losses: row.losses,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    };

    return User.create(userProps);
  }
}
