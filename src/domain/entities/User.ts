import { UserId } from '@domain/value-objects/UserId';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

export interface UserProps {
  id?: string;
  username: string;
  email: string;
  password: string; // hashed
  eloRating?: number;
  totalGames?: number;
  wins?: number;
  losses?: number;
  createdAt?: Date;
  lastLogin?: Date;
}

export class User {
  private readonly id: UserId;
  private username: string;
  private email: Email;
  private password: Password;
  private eloRating: number;
  private totalGames: number;
  private wins: number;
  private losses: number;
  private readonly createdAt: Date;
  private lastLogin: Date;

  private constructor(props: Required<UserProps>) {
    this.id = UserId.create(props.id);
    this.username = props.username;
    this.email = Email.create(props.email);
    this.password = Password.createFromHash(props.password);
    this.eloRating = props.eloRating;
    this.totalGames = props.totalGames;
    this.wins = props.wins;
    this.losses = props.losses;
    this.createdAt = props.createdAt;
    this.lastLogin = props.lastLogin;
  }

  public static create(props: UserProps): User {
    const now = new Date();
    return new User({
      id: props.id || UserId.create().getValue(),
      username: props.username,
      email: props.email,
      password: props.password,
      eloRating: props.eloRating ?? 1000,
      totalGames: props.totalGames ?? 0,
      wins: props.wins ?? 0,
      losses: props.losses ?? 0,
      createdAt: props.createdAt ?? now,
      lastLogin: props.lastLogin ?? now,
    });
  }

  public getId(): UserId {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPassword(): Password {
    return this.password;
  }

  public getEloRating(): number {
    return this.eloRating;
  }

  public getTotalGames(): number {
    return this.totalGames;
  }

  public getWins(): number {
    return this.wins;
  }

  public getLosses(): number {
    return this.losses;
  }

  public getWinRate(): number {
    return this.totalGames > 0 ? this.wins / this.totalGames : 0;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getLastLogin(): Date {
    return this.lastLogin;
  }

  public updateLastLogin(): void {
    this.lastLogin = new Date();
  }

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }

  public updateEloRating(newRating: number): void {
    this.eloRating = Math.max(0, newRating);
  }

  public recordWin(): void {
    this.wins++;
    this.totalGames++;
  }

  public recordLoss(): void {
    this.losses++;
    this.totalGames++;
  }

  public toJSON() {
    return {
      id: this.id.getValue(),
      username: this.username,
      email: this.email.getValue(),
      eloRating: this.eloRating,
      totalGames: this.totalGames,
      wins: this.wins,
      losses: this.losses,
      winRate: this.getWinRate(),
      createdAt: this.createdAt.toISOString(),
      lastLogin: this.lastLogin.toISOString(),
    };
  }
}
