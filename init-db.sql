-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  elo_rating INTEGER DEFAULT 1000,
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT positive_stats CHECK (total_games >= 0 AND wins >= 0 AND losses >= 0 AND elo_rating >= 0)
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team1_player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team1_player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team2_player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team2_player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'WAITING',
  phase VARCHAR(20) DEFAULT 'DEALING',
  current_dealer_index INTEGER DEFAULT 0,
  current_player_index INTEGER DEFAULT 1,
  team1_match_points INTEGER DEFAULT 0,
  team2_match_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT valid_phase CHECK (phase IN ('DEALING', 'BIDDING', 'DECLARING', 'PLAYING', 'SCORING', 'FINISHED')),
  CONSTRAINT valid_dealer_index CHECK (current_dealer_index >= 0 AND current_dealer_index < 4),
  CONSTRAINT valid_player_index CHECK (current_player_index >= 0 AND current_player_index < 4),
  CONSTRAINT positive_match_points CHECK (team1_match_points >= 0 AND team2_match_points >= 0)
);

-- Game rounds table
CREATE TABLE game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  dealer_id UUID NOT NULL REFERENCES users(id),
  trump_suit VARCHAR(20),
  contract_type VARCHAR(20),
  contract_team INTEGER,
  is_doubled BOOLEAN DEFAULT FALSE,
  is_redoubled BOOLEAN DEFAULT FALSE,
  team1_round_points INTEGER DEFAULT 0,
  team2_round_points INTEGER DEFAULT 0,
  team1_declarations JSONB DEFAULT '[]'::jsonb,
  team2_declarations JSONB DEFAULT '[]'::jsonb,
  tricks JSONB DEFAULT '[]'::jsonb,
  winner_team INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  CONSTRAINT valid_trump_suit CHECK (trump_suit IN ('CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES', 'NO_TRUMPS', 'ALL_TRUMPS')),
  CONSTRAINT valid_contract_team CHECK (contract_team IN (1, 2)),
  CONSTRAINT valid_winner_team CHECK (winner_team IN (1, 2)),
  CONSTRAINT positive_round_points CHECK (team1_round_points >= 0 AND team2_round_points >= 0)
);

-- Player hands table (for game state persistence)
CREATE TABLE player_hands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id),
  cards JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, round_id, player_id)
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES users(id),
  bid_type VARCHAR(20) NOT NULL,
  contract_type VARCHAR(20),
  bid_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_bid_type CHECK (bid_type IN ('PASS', 'CONTRACT', 'DOUBLE', 'REDOUBLE'))
);

-- Create indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_team1_player1 ON games(team1_player1_id);
CREATE INDEX idx_games_team1_player2 ON games(team1_player2_id);
CREATE INDEX idx_games_team2_player1 ON games(team2_player1_id);
CREATE INDEX idx_games_team2_player2 ON games(team2_player2_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

CREATE INDEX idx_game_rounds_game_id ON game_rounds(game_id);
CREATE INDEX idx_game_rounds_round_number ON game_rounds(game_id, round_number);

CREATE INDEX idx_player_hands_game_id ON player_hands(game_id);
CREATE INDEX idx_player_hands_player_id ON player_hands(player_id);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_elo_rating ON users(elo_rating DESC);

CREATE INDEX idx_bids_round_id ON bids(round_id);
CREATE INDEX idx_bids_player_id ON bids(player_id);
