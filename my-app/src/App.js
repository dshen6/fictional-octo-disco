import React, { Component } from 'react';
import ReconnectingWebsocket from 'reconnecting-websocket'

import './App.css';
import LobbyScreen from './lobby/LobbyScreen'
import GameplayScreen from './gameplay/GameplayScreen'
import TrollingScreen from './trolling/TrollingScreen'
import VotingScreen from './voting/VotingScreen'
import SummaryScreen from './summary/SummaryScreen'
import MockState from './MockState';

const SCREENS = {
  Lobby: 'LOBBY',
  Gameplay: 'GAMEPLAY',
  Trolling: 'TROLLING',
  Voting: 'VOTING',
  Summary: 'SUMMARY'
};

const SHOULD_MOCK_STATE = true;

const DEBUG = process.env.NODE_ENV === 'development'

function getHost() {
  if (DEBUG) {
    return 'localhost:8000'
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
  ws.send(JSON.stringify(message))
}

function handleMessage(message) {
  if (DEBUG) {
    console.log("onmessage", message);
  }
  const reader = new FileReader()

  reader.onload = () => {
    const data = JSON.parse(reader.result)
    console.log('Received', data);

    if (data.type === 'PlayerList') {
      this.setState({
      });
    } else if (data.type === 'PhraseUpdate') {
      this.setState({
      });
    } else if (data.type === '') {
      this.setState({
      });
    }
  }

  reader.readAsText(message.data)
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentScreen: SCREENS.Lobby,
      currentScreenTimer: 1,
      isSpectator: false, // whether you can do stuff or just watch
      isHost: true, // only used in lobby
      players: {}, // all players
      currentPlayerId: 1,
      votes: {}, // Summary Screen
      phrases: {}, // dict where key is playerId, value is their phrase as a string
      cards: [], // all cards dealt this round
      currentPlayerTrollTurnId: -1, // whose turn it is to troll, during trolling
    };

    // const ws = new ReconnectingWebsocket(`${getWsProtocol()}${getHost()}/socket`);
    // ws.onmessage = handleMessage.bind(this);
    // if (DEBUG) {
    //   ws.onopen = (e) => {
    //     console.log("opened", e);
    //   }
    //   ws.onclose = (e) => {
    //     console.log("closed", e);
    //   }
    //   ws.debug = true;
    // }

    // this.ws = ws
  }

  // for convenience
  _sendMessage = (message) => {
    sendMessage(this.ws, message);
  }

  onJoinRequest = (playerName, playerId) => {
    this._sendMessage({
      messageType: 'JoinRequest', 
      playerName: playerName, 
      playerId: playerId
    })
  }

  onStartGame = () => {
    this._sendMessage({ messageType: 'StartGame' })
  }

  onUseCard = (cardType, position1, position2, playerId2, payload) => {
    this._sendMessage({
      messageType: 'UseCard',
      cardType: cardType,
      position1: position1,
      position2: position2,
      playerId2: playerId2,
      payload: payload
    });
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
          onJoinRequest = {state.onJoinRequest} 
          onStartGame = {state.onStartGame} />
        break;
        
      case SCREENS.Gameplay:
        pageComponent = 
        <GameplayScreen
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          phrases = {state.phrases}
          cards = {state.cards}
          isSpectator = {state.isSpectator}
          onUseCard = {state.onUseCard} />
        break;
      
      case SCREENS.Trolling:
        pageComponent = 
        <TrollingScreen
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          phrases = {state.phrases}
          isSpectator = {state.isSpectator}
          currentPlayerTrollTurnId = {state.currentPlayerTrollTurnId}
          onUseCard = {state.onUseCard} />
        break;
      
      case SCREENS.Voting:
        pageComponent = 
        <VotingScreen
          currentPlayerId = {state.currentPlayerId}
          players = {state.players}
          phrases = {state.phrases}
          votes = {state.votes}
          isSpectator = {state.isSpectator}
          onVote = {state.onVote} />
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
