export default {
    currentScreen: 'planning',
    currentScreenTimer: 100,
    isSpectator: false, // whether you can do stuff or just watch
    isHost: true, // only used in lobby
    players: {"0": "JT", "1": "Someone else", "2": "jim"}, // all players
    currentPlayerId: "0",
    votes: {
        "0": 2,
        "1": 1,
        "2": 2,
        "3": 0
    }, // Voting Screen
    phrases: {  "0": ["face", "bready", "slow", "wonders", "the", "slow"],
                "1": ["Salty", "and", "unsteady", "wounds", "the", "face"],
                "2": ["farce", "bready", "screaming", "wonders", "stinky", "race"],
                "3": ["Glow", "Relapse", "and", "and", "Face"]
            }, // dict where key is playerId, value is their phrase as a string
    cards: ["troll", "swap", "subvert", "swap"], // all cards dealt this round
    currentPlayerTrollTurnId: "0", // whose turn it is to troll, during trolling
    lockedWords: { "0": [1, 2, 3] }, // dict where key is playerId, value is array of word indices 
    useCardError: "you are cool!!" // error message if a card was incorrectly used
}