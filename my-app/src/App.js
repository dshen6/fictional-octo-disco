import React, { Component } from 'react';
import ReconnectingWebsocket from 'reconnecting-websocket'

import './App.css';
import LobbyScreen from './lobby/LobbyScreen'
import PlanningScreen from './planning/PlanningScreen'
import TrollingScreen from './trolling/TrollingScreen'
import VotingScreen from './voting/VotingScreen'
import ResultsScreen from './results/ResultsScreen'
import SummaryScreen from './summary/SummaryScreen'
import MockState from './MockState';

const SCREENS = {
  Lobby: 'lobby',
  Planning: 'planning',
  Trolling: 'trolling',
  Voting: 'voting',
  Results: 'results',
  Summary: 'summary'
};

const SHOULD_MOCK_STATE = false;

const DEBUG = process.env.NODE_ENV === 'development'

function getHost() {
  if (DEBUG) {
    return 'localhost:8080'
  } else {
    return window.location.host
  }
}

function getWsProtocol() {
  if (window.location.protocol === 'https:') {
    return 'wss://'
  } else {
    return 'ws://'
  }
}

function sendMessage(ws, message) {
  console.log("sending", JSON.stringify(message))
  ws.send(JSON.stringify(message))
}

function handleMessage(message) {
  const msg = JSON.parse(message.data)
  console.log('Received', msg);
  switch (msg.messageType) {
    case "JoinResponse":
      this.setState({
        currentPlayerId: msg.playerId,
        isSpectator: msg.isSpectator,
        isHost: msg.isHost,
      })
      localStorage.setItem("playerId", msg.playerId)
      break;

    case "PlayerList":
      this.setState({
        players: msg.players
      })
      break;

    case "GameStateUpdate":
      console.log("Game State Update", msg.state, msg.timer)
      this.setState({
        currentScreen: msg.state,
        currentScreenTimer: msg.timer,
      })
      break;
    case "PhraseUpdate":
        // update phrase for just this player
        const phraseMap = this.state.phrases
        phraseMap[msg.playerId] = msg.phrase
        this.setState({
          phrases: phraseMap
        })
      break;
    case "UseCardError":
      this.setState({
        useCardError: msg.cardIndex
      })
      break;
    case "CardConsumed":
      // update phrase for just this player
      const currentPhraseMap = this.state.phrases
      const playerPhrases = currentPhraseMap[msg.playerId]
      playerPhrases.splice(msg.cardIndex, 1)
      currentPhraseMap[msg.playerId] = playerPhrases
      this.setState({
        phrases: currentPhraseMap,
        useCardError: -1
      })
      break;
    case "GlobalPhraseUpdate":
      this.setState({
        phrases: msg.phrases,
        lockedWords: msg.lockedWords
      })
      break;
    case "DeckDeal":
      if (msg.playerId === this.state.currentPlayerId) {
        this.setState({
          cards: msg.cards
        })
      }
      break;
    case "PlayerTurn":
      this.setState({
        currentPlayerTrollTurnId: msg.playerId
      })
      break;

    case "VoteTotals":
      this.setState({
        votes: msg.votes
      })
      break;
  
    default:
      break;
  }
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentScreen: SCREENS.Lobby,
      currentScreenTimer: 0,
      isSpectator: false, // whether you can do stuff or just watch
      isHost: false, // only used in lobby
      players: {}, // all players
      currentPlayerId: null,
      votes: {}, // Voting Screen
      phrases: {}, // dict where key is playerId, value is their phrase as a string
      cards: [], // all cards dealt this round
      currentPlayerTrollTurnId: -1, // whose turn it is to troll, during trolling
      lockedWords: {}, // dict where key is playerId, value is array of word indices 
      useCardError: -1, // index of card that was used incorrectly, -1 if none
    };

    const ws = new ReconnectingWebsocket(`${getWsProtocol()}${getHost()}/socket`);
    ws.onmessage = handleMessage.bind(this);
    if (DEBUG) {
      ws.onopen = (e) => {
        console.log("opened", e);
      }
      ws.onclose = (e) => {
        console.log("closed", e);
      }
      ws.debug = true;
    }

    this.ws = ws
  }

  // for convenience
  _sendMessage = (message) => {
    sendMessage(this.ws, message);
  }

  onJoinRequest = (playerName) => {
    var payload = {
      messageType: 'JoinRequest', 
      playerName: playerName,
      // ...(localStorage.getItem("playerId") !== null && {playerId: localStorage.getItem("playerId") })
    }
    this._sendMessage(payload)
  }

  onStartGame = () => {
    this._sendMessage({ messageType: 'StartGame' })
  }

  onUseCard = (cardIndex, position1, position2, playerId2, wordText, mode) => {
    var payload = {
      messageType: 'UseCard',
      cardIndex: cardIndex,
      position1: position1,
    }
    payload = {...payload,
      ...(position2 > -1 && {position2: position2}),
      ...(playerId2 > -1 && {playerId2: playerId2}),
      ...(wordText.length > 0 && {wordText: wordText}),
      ...(mode && {mode: mode}) // 'delete' or 'stinky'
      }
    this._sendMessage(payload);
  }

  onVote = (playerId) => {
    this._sendMessage({
      messageType: 'Vote',
      playerId: playerId
    });
  }

  // override this to mock state
  _getState = () => {
    if (SHOULD_MOCK_STATE) {
      return MockState;
    } else {
      return this.state;
    }
  }

  render() {
    const state = this._getState();
    console.log("State: ", state);
    let pageComponent = null;
    switch (state.currentScreen) {
      case SCREENS.Lobby:
        pageComponent = 
        <LobbyScreen 
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          isHost = {state.isHost}
          isSpectator = {state.isSpectator}
          onJoinRequest = {this.onJoinRequest} 
          onStartGame = {this.onStartGame}
          />
        break;
        
      case SCREENS.Planning:
        pageComponent = 
        <PlanningScreen
          currentPlayerId = {state.currentPlayerId}
          currentScreenTimer = {state.currentScreenTimer}
          players = {state.players}
          phrases = {state.phrases || {}}
          cards = {state.cards}
          isSpectator = {state.isSpectator}
          useCardError = {state.useCardError}
          onUseCard = {this.onUseCard} />
        break;
      
      case SCREENS.Trolling:
        pageComponent = 
        <TrollingScreen
          currentPlayerId = {state.currentPlayerId}
          currentScreenTimer = {state.currentScreenTimer}
          players = {state.players}
          phrases = {state.phrases}
          isSpectator = {state.isSpectator}
          currentPlayerTrollTurnId = {state.currentPlayerTrollTurnId}
          lockedWords = {state.lockedWords}
          useCardError = {state.useCardError}
          onUseCard = {this.onUseCard} />
        break;
      
      case SCREENS.Voting:
        pageComponent = 
        <VotingScreen
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          phrases = {state.phrases}
          votes = {state.votes}
          isSpectator = {state.isSpectator}
          onVote = {this.onVote} />
        break;

      case SCREENS.Results:
        pageComponent =
        <ResultsScreen
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          phrases = {state.phrases}
          votes = {state.votes}
          isSpectator = {state.isSpectator} />
        break;

      case SCREENS.Summary:
        pageComponent = 
        <SummaryScreen
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          phrases = {state.phrases}
          votes = {state.votes}
          isSpectator = {state.isSpectator} />
        break;
    
      default:
        break;
    }
    return (
      <section className='game-container'>
        {pageComponent}
      </section>
    );
  };
}

export default App;
