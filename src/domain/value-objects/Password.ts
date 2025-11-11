import bcrypt from 'bcryptjs';
import { config } from '@infrastructure/config';

export class Password {
  private readonly hashedValue: string;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  public static async create(plainPassword: string): Promise<Password> {
    if (!this.isValid(plainPassword)) {
      throw new Error('Password must be at least 8 characters long and contain letters and numbers');
    }
    const hashed = await bcrypt.hash(plainPassword, config.security.bcryptRounds);
    return new Password(hashed);
  }

  public static createFromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  private static isValid(password: string): boolean {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasLetter && hasNumber;
  }

  public async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  public getValue(): string {
    return this.hashedValue;
  }
}
