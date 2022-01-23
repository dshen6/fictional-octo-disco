import './LobbyScreen.css';
import React, { useState } from "react";

function LobbyScreen(props) {
  const [name, setName] = useState("");

  const playerLimit = 4
  const playerNames = Object.keys(props.players).map(function(key){
    return props.players[key];
  });
  return (
    <section className='lobby-container game-page-container'>
      <h1>Join the game!</h1>
      <PlayerIconRow playerNames={playerNames}/>
      <ReadyText readyPlayerCount={playerNames.length} playerLimit={playerLimit}/>
      <StartGameButton onStartGame ={props.onStartGame}/>
      <NameInput onJoinRequest={props.onJoinRequest}
        name={name}
        setName={setName}/>
    </section>
  )
}

function PlayerIconRow(props) {
  // Map function: For name in player names, spit it out into player icon
  const playerIcons = props.playerNames.map((name, i) => <PlayerIcon playerName={name} key={i}/>)
  return (
    <ul className='player-list list-unstyled list-horizontal'>
        {playerIcons}
    </ul>
  );
}

function PlayerIcon(props) {
  return(
    <li className='player-list-item'>
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
      <button className='button' onClick={props.onStartGame}>Start Game</button>
    </div>
  )
}

function NameInput(props) {
  return (
    <form className='player-name-form form-horizontal-layout' onSubmit={_ => props.onJoinRequest(props.name)}>
      <input type='text' placeholder='Enter name' value={props.name} onChange={e => props.setName(e.target.value)}/>
      <button className='button' type='submit'>Ready</button>
    </form>
  )
}
  
export default LobbyScreen;
