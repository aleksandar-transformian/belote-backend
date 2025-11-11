import { ContractType, Declaration, LAST_TRICK_BONUS, VALAT_BONUS } from '@domain/types/GameTypes';

export interface RoundScore {
  team1Points: number;
  team2Points: number;
  team1Declarations: number;
  team2Declarations: number;
  contractFulfilled: boolean;
  isValat: boolean;
}

export interface MatchPoints {
  team1: number;
  team2: number;
}

export class ScoringService {
  public static calculateRoundScore(
    team1TrickPoints: number,
    team2TrickPoints: number,
    team1Declarations: Declaration[],
    team2Declarations: Declaration[],
    contractTeam: 1 | 2,
    contract: ContractType,
    isDoubled: boolean,
    isRedoubled: boolean
  ): RoundScore {
    let team1Total = team1TrickPoints;
    let team2Total = team2TrickPoints;

    // Add declaration points
    const team1DeclPoints = team1Declarations.reduce((sum, d) => sum + d.points, 0);
    const team2DeclPoints = team2Declarations.reduce((sum, d) => sum + d.points, 0);

    team1Total += team1DeclPoints;
    team2Total += team2DeclPoints;

    // Check valat (one team wins all tricks)
    const isValat = team1TrickPoints === 0 || team2TrickPoints === 0;

    // Check if contract was fulfilled
    const contractTeamPoints = contractTeam === 1 ? team1Total : team2Total;
    const contractFulfilled = contractTeamPoints > (team1Total + team2Total) / 2;

    let result: RoundScore = {
      team1Points: team1Total,
      team2Points: team2Total,
      team1Declarations: team1DeclPoints,
      team2Declarations: team2DeclPoints,
      contractFulfilled,
      isValat,
    };

    // If contract not fulfilled, all points go to opposing team
    if (!contractFulfilled) {
      if (contractTeam === 1) {
        result.team1Points = 0;
        result.team2Points = team1Total + team2Total;
      } else {
        result.team1Points = team1Total + team2Total;
        result.team2Points = 0;
      }
    }

    // Apply multipliers
    if (contract === ContractType.NO_TRUMPS) {
      result.team1Points *= 2;
      result.team2Points *= 2;
    }

    if (isDoubled) {
      result.team1Points *= 2;
      result.team2Points *= 2;
    }

    if (isRedoubled) {
      result.team1Points *= 4;
      result.team2Points *= 4;
    }

    return result;
  }

  public static convertToMatchPoints(roundScore: RoundScore, contract: ContractType): MatchPoints {
    const totalPoints = contract === ContractType.NO_TRUMPS ? 260 :
                       contract === ContractType.ALL_TRUMPS ? 258 : 162;

    const roundingLimit = contract === ContractType.NO_TRUMPS ? 5 :
                         contract === ContractType.ALL_TRUMPS ? 4 : 6;

    let team1MP = this.roundMatchPoints(roundScore.team1Points, totalPoints, roundingLimit);
    let team2MP = this.roundMatchPoints(roundScore.team2Points, totalPoints, roundingLimit);

    // Add valat bonus
    if (roundScore.isValat) {
      const valatBonus = contract === ContractType.NO_TRUMPS ? VALAT_BONUS * 2 : VALAT_BONUS;
      if (roundScore.team1Points > roundScore.team2Points) {
        team1MP += valatBonus;
      } else {
        team2MP += valatBonus;
      }
    }

    return { team1: team1MP, team2: team2MP };
  }

  private static roundMatchPoints(points: number, totalPoints: number, roundingLimit: number): number {
    const exactMP = points / 10;
    const remainder = points % 10;

    if (remainder < roundingLimit) {
      return Math.floor(exactMP);
    } else if (remainder > roundingLimit) {
      return Math.ceil(exactMP);
    } else {
      // At rounding limit - special rule
      return Math.round(exactMP);
    }
  }
}
