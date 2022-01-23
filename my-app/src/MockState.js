export default {
    currentScreen: 'planning',
    currentScreenTimer: 100,
    isSpectator: false, // whether you can do stuff or just watch
    isHost: true, // only used in lobby
    players: {"0": "JT", "1": "Someone else", "2": "jim", "3": "billobobbo"}, // all players
    currentPlayerId: 1,
    votes: {
        "0": 2,
        "1": 1,
        "2": 1,
        "4": 0
    }, // Voting, summary Screen
    phrases: {  "0": ["face", "bready", "slow", "wonders", "the", "slow"],
                "1": ["Salty", "and", "unsteady", "wounds", "the", "face"],
                "2": ["face", "bready", "slow", "wonders", "the", "slow"],
                "3": ["Glow", "Relapse", "and", "and", "Face"]
            }, // dict where key is playerId, value is their phrase as a string
    cards: ["troll", "swap", "subvert", "swap"], // all cards dealt this round
    currentPlayerTrollTurnId: -1, // whose turn it is to troll, during trolling
}