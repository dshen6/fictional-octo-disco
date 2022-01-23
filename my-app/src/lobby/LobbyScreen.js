import './LobbyScreen.css';

function LobbyScreen(props) {
  const playerLimit = 4
  const playerNames = Object.keys(props.players).map(function(key){
    return props.players[key];
  });
  return (
    <section className='lobby-container'>
      <h1>Join the game!</h1>
      <PlayerIconRow playerNames={playerNames}/>
      <ReadyText readyPlayerCount={playerNames.length} playerLimit={playerLimit}/>
      <ReadyButton />
      <NameInput />
    </section>
  )
}

function PlayerIconRow(props) {
  // Map function: For name in player names, spit it out into player icon
  const playerIcons = props.playerNames.map(name => <PlayerIcon playerName={name} key={name}/>)
  return (
    <ul className='player-list list-unstyled list-horizontal'>
        {playerIcons}
    </ul>
  );
}

function PlayerIcon(props) {
  return(
    <li class='player-list-item'>
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

function ReadyButton() {
  return (
    <div className='ready-section'>
      <button className='button'>Start Game</button>
    </div>
  )
}

function NameInput() {
  return (
    <form className='player-name-form form-horizontal-layout'>
      <input type='text' placeholder='Enter name'/>
      <NameInputEnter />
    </form>
  )
}
  
function NameInputEnter() {
  return (
    <button className='button'>Ready</button>
  )
}

export default LobbyScreen;
