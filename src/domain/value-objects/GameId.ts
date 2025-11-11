export class GameId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value?: string): GameId {
    const id = value || this.generateId();
    if (!this.isValid(id)) {
      throw new Error('Invalid GameId format');
    }
    return new GameId(id);
  }

  private static isValid(value: string): boolean {
    return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
  }

  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: GameId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
