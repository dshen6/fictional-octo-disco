export default {
    currentScreen: 'GAMEPLAY',
    currentScreenTimer: 1,
    isSpectator: false, // whether you can do stuff or just watch
    isHost: true, // only used in lobby
    players: {"0": "JT", "1": "Someone else"}, // all players
    currentPlayerId: 1,
    votes: {}, // Summary Screen
    phrases: {"0": ["a", "cat", "has", "nine", "lives"], "1": ["i", "am", "bmo"] }, // dict where key is playerId, value is their phrase as a string
    cards: ["troll", "swap", "subvert", "swap"], // all cards dealt this round
    currentPlayerTrollTurnId: -1, // whose turn it is to troll, during trolling
}