import './LobbyScreen.css';
import React, { useState } from "react";

function LobbyScreen(props) {
  const [name, setName] = useState("");

  const playerLimit = 4
  const playerNames = Object.keys(props.players).map(function(key){
    return props.players[key];
  });

  const currentPlayerName = props.players[props.currentPlayerId]

  return (
    <section className='lobby-container game-page-container'>
      <span className='instructions'>
        We are wordsmiths that transform old sayings into better versions. Each player is given a copy of the same phrase, and uses cards to perform specific transformations to their version of the phrase. Then, we vote for which versions are best.
      </span>
      <h1>Join the game!</h1>
      <PlayerIconRow playerNames={playerNames} currentPlayerName = {currentPlayerName} />
      <ReadyText readyPlayerCount={playerNames.length} playerLimit={playerLimit}/>
      {props.isHost && <StartGameButton onStartGame ={props.onStartGame}/> }
      {!currentPlayerName &&
        <NameInput
          onJoinRequest={props.onJoinRequest}
          name={name}
          setName={setName}/>
      }
    </section>
  )
}

function PlayerIconRow(props) {
  // Map function: For name in player names, spit it out into player icon
  const playerIcons = props.playerNames.map((name, i) => {
    const isCurrentPlayer = name === props.currentPlayerName;
    return <PlayerIcon playerName={name} key={i} isCurrentPlayer={isCurrentPlayer}/>
  })
  return (
    <ul className='player-list list-unstyled list-horizontal'>
        {playerIcons}
    </ul>
  );
}

function PlayerIcon(props) {
  const currentPlayerClassName = props.isCurrentPlayer ? 'current-player' :  ''
  return(
    <li className={`player-list-item ${currentPlayerClassName}`}>
        <div className='player-ready-icon'>👍</div>
        <h2 className='player-text'>{props.playerName}</h2>
    </li>
  );
}

function ReadyText(props) {
  return (
      <h3 className='ready-text'>{props.readyPlayerCount}/{props.playerLimit} Ready</h3>
  );
}

function StartGameButton(props) {
  return (
    <div className='ready-section'>
      <button className='button' onClick={props.onStartGame}>Start game</button>
    </div>
  )
}

function NameInput(props) {
  return (
    <form className='player-name-form form-horizontal-layout' onSubmit={e => {
        e.preventDefault();
        if (props.name.length > 0) {
          props.onJoinRequest(props.name);
        }
      }
    }>
      <input autoFocus type='text' placeholder='Enter name' value={props.name} onChange={e => props.setName(e.target.value)}/>
      <button className='button' type='submit'>Ready</button>
    </form>
  )
}
  
export default LobbyScreen;
