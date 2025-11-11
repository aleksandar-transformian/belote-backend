import { Card } from '@domain/entities/Card';
import { Declaration, DeclarationType } from '@domain/types/GameTypes';
import { Suit } from '@domain/value-objects/Suit';
import { Rank, RankType } from '@domain/value-objects/Rank';

export class DeclarationService {
  public static findDeclarations(hand: Card[], trumpSuit: Suit | null): Declaration[] {
    const declarations: Declaration[] = [];

    // Find sequences
    declarations.push(...this.findSequences(hand));

    // Find squares (4 of a kind)
    declarations.push(...this.findSquares(hand));

    // Find belote (King + Queen of trump)
    if (trumpSuit) {
      const belote = this.findBelote(hand, trumpSuit);
      if (belote) {
        declarations.push(belote);
      }
    }

    return declarations;
  }

  private static findSequences(hand: Card[]): Declaration[] {
    const declarations: Declaration[] = [];
    const suits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];

    for (const suitStr of suits) {
      const suitCards = hand.filter(c => c.getSuit().getValue() === suitStr);
      if (suitCards.length < 3) continue;

      // Sort by sequence order: A, K, Q, J, 10, 9, 8, 7
      const sequenceOrder = [RankType.ACE, RankType.KING, RankType.QUEEN, RankType.JACK,
                             RankType.TEN, RankType.NINE, RankType.EIGHT, RankType.SEVEN];

      suitCards.sort((a, b) => {
        return sequenceOrder.indexOf(a.getRank().getValue()) -
               sequenceOrder.indexOf(b.getRank().getValue());
      });

      // Find consecutive sequences
      let currentSequence: Card[] = [suitCards[0]];

      for (let i = 1; i < suitCards.length; i++) {
        const prevRankIndex = sequenceOrder.indexOf(suitCards[i - 1].getRank().getValue());
        const currRankIndex = sequenceOrder.indexOf(suitCards[i].getRank().getValue());

        if (currRankIndex === prevRankIndex + 1) {
          currentSequence.push(suitCards[i]);
        } else {
          if (currentSequence.length >= 3) {
            declarations.push(this.createSequenceDeclaration(currentSequence));
          }
          currentSequence = [suitCards[i]];
        }
      }

      if (currentSequence.length >= 3) {
        declarations.push(this.createSequenceDeclaration(currentSequence));
      }
    }

    return declarations;
  }

  private static createSequenceDeclaration(sequence: Card[]): Declaration {
    let type: DeclarationType;
    let points: number;

    if (sequence.length >= 5) {
      type = DeclarationType.QUINTE;
      points = 100;
    } else if (sequence.length === 4) {
      type = DeclarationType.QUARTE;
      points = 50;
    } else {
      type = DeclarationType.TIERCE;
      points = 20;
    }

    return {
      type,
      cards: sequence.map(c => c.toString()),
      points,
      playerId: '', // Will be set by use case
    };
  }

  private static findSquares(hand: Card[]): Declaration[] {
    const declarations: Declaration[] = [];
    const rankCounts: Map<RankType, Card[]> = new Map();

    // Count cards by rank
    for (const card of hand) {
      const rank = card.getRank().getValue();
      if (!rankCounts.has(rank)) {
        rankCounts.set(rank, []);
      }
      rankCounts.get(rank)!.push(card);
    }

    // Find 4 of a kind
    for (const [rank, cards] of rankCounts.entries()) {
      if (cards.length === 4) {
        let type: DeclarationType;
        let points: number;

        if (rank === RankType.JACK) {
          type = DeclarationType.SQUARE_JACKS;
          points = 200;
        } else if (rank === RankType.NINE) {
          type = DeclarationType.SQUARE_NINES;
          points = 150;
        } else if (rank === RankType.ACE) {
          type = DeclarationType.SQUARE_ACES;
          points = 100;
        } else if (rank === RankType.TEN) {
          type = DeclarationType.SQUARE_TENS;
          points = 100;
        } else if (rank === RankType.KING) {
          type = DeclarationType.SQUARE_KINGS;
          points = 100;
        } else if (rank === RankType.QUEEN) {
          type = DeclarationType.SQUARE_QUEENS;
          points = 100;
        } else {
          continue; // 7s and 8s don't count
        }

        declarations.push({
          type,
          cards: cards.map(c => c.toString()),
          points,
          playerId: '',
        });
      }
    }

    return declarations;
  }

  private static findBelote(hand: Card[], trumpSuit: Suit): Declaration | null {
    const king = hand.find(c =>
      c.getSuit().equals(trumpSuit) && c.getRank().getValue() === RankType.KING
    );
    const queen = hand.find(c =>
      c.getSuit().equals(trumpSuit) && c.getRank().getValue() === RankType.QUEEN
    );

    if (king && queen) {
      return {
        type: DeclarationType.BELOTE,
        cards: [king.toString(), queen.toString()],
        points: 20,
        playerId: '',
      };
    }

    return null;
  }

  public static compareDeclarations(dec1: Declaration, dec2: Declaration): number {
    // Higher points win
    if (dec1.points !== dec2.points) {
      return dec2.points - dec1.points;
    }

    // Same points - compare highest card in sequence
    // (Implementation simplified)
    return 0;
  }
}
