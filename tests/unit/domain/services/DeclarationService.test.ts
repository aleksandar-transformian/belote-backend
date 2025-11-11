import { DeclarationService } from '@domain/services/DeclarationService';
import { Card } from '@domain/entities/Card';
import { SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';
import { Suit } from '@domain/value-objects/Suit';
import { DeclarationType } from '@domain/types/GameTypes';

describe('DeclarationService', () => {
  describe('findDeclarations', () => {
    it('should find a tierce (3-card sequence)', () => {
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);
      expect(declarations).toHaveLength(1);
      expect(declarations[0].type).toBe(DeclarationType.TIERCE);
      expect(declarations[0].points).toBe(20);
    });

    it('should find a quarte (4-card sequence)', () => {
      const hand = [
        Card.create({ suit: SuitType.SPADES, rank: RankType.ACE }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.KING }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.JACK }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);
      expect(declarations).toHaveLength(1);
      expect(declarations[0].type).toBe(DeclarationType.QUARTE);
      expect(declarations[0].points).toBe(50);
    });

    it('should find a quinte (5-card sequence)', () => {
      const hand = [
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.KING }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.TEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);
      expect(declarations).toHaveLength(1);
      expect(declarations[0].type).toBe(DeclarationType.QUINTE);
      expect(declarations[0].points).toBe(100);
    });

    it('should find square of jacks', () => {
      const hand = [
        Card.create({ suit: SuitType.CLUBS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.JACK }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);
      expect(declarations).toHaveLength(1);
      expect(declarations[0].type).toBe(DeclarationType.SQUARE_JACKS);
      expect(declarations[0].points).toBe(200);
    });

    it('should find square of nines', () => {
      const hand = [
        Card.create({ suit: SuitType.CLUBS, rank: RankType.NINE }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.NINE }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.NINE }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.NINE }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);
      expect(declarations).toHaveLength(1);
      expect(declarations[0].type).toBe(DeclarationType.SQUARE_NINES);
      expect(declarations[0].points).toBe(150);
    });

    it('should find belote (King + Queen of trump)', () => {
      const trumpSuit = Suit.create(SuitType.HEARTS);
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, trumpSuit);
      const belote = declarations.find(d => d.type === DeclarationType.BELOTE);
      expect(belote).toBeDefined();
      expect(belote?.points).toBe(20);
    });

    it('should not find belote if not trump suit', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, trumpSuit);
      const belote = declarations.find(d => d.type === DeclarationType.BELOTE);
      expect(belote).toBeUndefined();
    });
  });
});
