import { UserId } from '@domain/value-objects/UserId';

describe('UserId Value Object', () => {
  it('should create valid UserId with generated UUID', () => {
    const userId = UserId.create();
    expect(userId.getValue()).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
    );
  });

  it('should create UserId from valid UUID string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const userId = UserId.create(uuid);
    expect(userId.getValue()).toBe(uuid);
  });

  it('should throw error for invalid UUID format', () => {
    expect(() => UserId.create('invalid-uuid')).toThrow('Invalid UserId format');
  });

  it('should compare UserIds correctly', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const userId1 = UserId.create(uuid);
    const userId2 = UserId.create(uuid);
    const userId3 = UserId.create();

    expect(userId1.equals(userId2)).toBe(true);
    expect(userId1.equals(userId3)).toBe(false);
  });

  it('should convert to string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const userId = UserId.create(uuid);
    expect(userId.toString()).toBe(uuid);
  });
});
