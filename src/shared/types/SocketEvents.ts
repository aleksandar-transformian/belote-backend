// Client -> Server Events
export enum ClientEvents {
  // Authentication
  AUTHENTICATE = 'authenticate',

  // Matchmaking
  JOIN_QUEUE = 'join_queue',
  LEAVE_QUEUE = 'leave_queue',
  CREATE_PRIVATE_ROOM = 'create_private_room',
  JOIN_PRIVATE_ROOM = 'join_private_room',

  // Game
  JOIN_GAME = 'join_game',
  READY = 'ready',
  PLACE_BID = 'place_bid',
  PLAY_CARD = 'play_card',
  DECLARE = 'declare',

  // Communication
  SEND_EMOTE = 'send_emote',
  DISCONNECT_FROM_GAME = 'disconnect_from_game',
}

// Server -> Client Events
export enum ServerEvents {
  // Authentication
  AUTHENTICATED = 'authenticated',
  AUTH_ERROR = 'auth_error',

  // Matchmaking
  QUEUE_JOINED = 'queue_joined',
  QUEUE_LEFT = 'queue_left',
  MATCH_FOUND = 'match_found',
  ROOM_CREATED = 'room_created',

  // Game Lifecycle
  GAME_STARTING = 'game_starting',
  GAME_STARTED = 'game_started',
  ROUND_STARTING = 'round_starting',
  PHASE_CHANGED = 'phase_changed',

  // Game Actions
  CARDS_DEALT = 'cards_dealt',
  BID_PLACED = 'bid_placed',
  BIDDING_COMPLETE = 'bidding_complete',
  CARD_PLAYED = 'card_played',
  TRICK_COMPLETE = 'trick_complete',
  DECLARATION_MADE = 'declaration_made',

  // Game End
  ROUND_COMPLETE = 'round_complete',
  GAME_COMPLETE = 'game_complete',

  // Player Events
  PLAYER_JOINED = 'player_joined',
  PLAYER_READY = 'player_ready',
  PLAYER_DISCONNECTED = 'player_disconnected',
  PLAYER_RECONNECTED = 'player_reconnected',
  BOT_TAKEOVER = 'bot_takeover',

  // Errors
  INVALID_ACTION = 'invalid_action',
  ERROR = 'error',

  // Turn
  YOUR_TURN = 'your_turn',
  TURN_TIMEOUT = 'turn_timeout',
}
