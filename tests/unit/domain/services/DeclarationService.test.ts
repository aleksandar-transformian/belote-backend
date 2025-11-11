import { DeclarationService } from '@domain/services/DeclarationService';
import { Card } from '@domain/entities/Card';
import { Suit, SuitType } from '@domain/value-objects/Suit';
import { RankType } from '@domain/value-objects/Rank';
import { DeclarationType } from '@domain/types/GameTypes';

describe('DeclarationService', () => {
  describe('findDeclarations', () => {
    it('should find tierce (3 card sequence)', () => {
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.EIGHT }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      const tierce = declarations.find(d => d.type === DeclarationType.TIERCE);
      expect(tierce).toBeDefined();
      expect(tierce?.points).toBe(20);
      expect(tierce?.cards.length).toBe(3);
    });

    it('should find quarte (4 card sequence)', () => {
      const hand = [
        Card.create({ suit: SuitType.SPADES, rank: RankType.ACE }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.KING }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.JACK }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      const quarte = declarations.find(d => d.type === DeclarationType.QUARTE);
      expect(quarte).toBeDefined();
      expect(quarte?.points).toBe(50);
      expect(quarte?.cards.length).toBe(4);
    });

    it('should find quinte (5 card sequence)', () => {
      const hand = [
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.KING }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.TEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      const quinte = declarations.find(d => d.type === DeclarationType.QUINTE);
      expect(quinte).toBeDefined();
      expect(quinte?.points).toBe(100);
      expect(quinte?.cards.length).toBe(5);
    });

    it('should find square of jacks', () => {
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.JACK }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.JACK }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      const square = declarations.find(d => d.type === DeclarationType.SQUARE_JACKS);
      expect(square).toBeDefined();
      expect(square?.points).toBe(200);
      expect(square?.cards.length).toBe(4);
    });

    it('should find square of nines', () => {
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.NINE }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.NINE }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.NINE }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.NINE }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      const square = declarations.find(d => d.type === DeclarationType.SQUARE_NINES);
      expect(square).toBeDefined();
      expect(square?.points).toBe(150);
      expect(square?.cards.length).toBe(4);
    });

    it('should find square of aces', () => {
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.ACE }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.ACE }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      const square = declarations.find(d => d.type === DeclarationType.SQUARE_ACES);
      expect(square).toBeDefined();
      expect(square?.points).toBe(100);
      expect(square?.cards.length).toBe(4);
    });

    it('should find belote (King + Queen of trump)', () => {
      const trumpSuit = Suit.create(SuitType.HEARTS);
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.EIGHT }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, trumpSuit);

      const belote = declarations.find(d => d.type === DeclarationType.BELOTE);
      expect(belote).toBeDefined();
      expect(belote?.points).toBe(20);
      expect(belote?.cards.length).toBe(2);
    });

    it('should not find belote if not trump suit', () => {
      const trumpSuit = Suit.create(SuitType.SPADES);
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.KING }),
        Card.create({ suit: SuitType.HEARTS, rank: RankType.QUEEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.EIGHT }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, trumpSuit);

      const belote = declarations.find(d => d.type === DeclarationType.BELOTE);
      expect(belote).toBeUndefined();
    });

    it('should not find square of sevens', () => {
      const hand = [
        Card.create({ suit: SuitType.HEARTS, rank: RankType.SEVEN }),
        Card.create({ suit: SuitType.DIAMONDS, rank: RankType.SEVEN }),
        Card.create({ suit: SuitType.CLUBS, rank: RankType.SEVEN }),
        Card.create({ suit: SuitType.SPADES, rank: RankType.SEVEN }),
      ];

      const declarations = DeclarationService.findDeclarations(hand, null);

      expect(declarations.length).toBe(0); // 7s don't count as square
    });
  });

  describe('compareDeclarations', () => {
    it('should prioritize higher points', () => {
      const dec1 = {
        type: DeclarationType.TIERCE,
        cards: [],
        points: 20,
        playerId: '1',
      };
      const dec2 = {
        type: DeclarationType.QUINTE,
        cards: [],
        points: 100,
        playerId: '2',
      };

      const result = DeclarationService.compareDeclarations(dec1, dec2);
      expect(result).toBeGreaterThan(0); // dec2 wins (higher points)
    });

    it('should return 0 for equal points', () => {
      const dec1 = {
        type: DeclarationType.TIERCE,
        cards: [],
        points: 20,
        playerId: '1',
      };
      const dec2 = {
        type: DeclarationType.TIERCE,
        cards: [],
        points: 20,
        playerId: '2',
      };

      const result = DeclarationService.compareDeclarations(dec1, dec2);
      expect(result).toBe(0);
    });
  });
});
