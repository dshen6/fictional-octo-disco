import './LobbyScreen.css';

function LobbyScreen() {
  const player_names = ['jax', 'daxter','ratchet','clank']
  const player_limit = 4
  return (
    <section className='lobby-container game-page-container'>
      <h1>Join the game!</h1>
      <PlayerIconRow player_names={player_names}/>
      <ReadyText ready_player_count='4' player_limit={player_limit}/>
      <ReadyButton />
      <NameInput />
    </section>
  )
}

function PlayerIconRow(props) {
  // Map function: For name in player names, spit it out into player icon
  const player_icons = props.player_names.map(name => <PlayerIcon player_name={name} key={name}/>)
  return (
    <ul className='player-list list-unstyled list-horizontal'>
        {player_icons}
    </ul>
  );
}

function PlayerIcon(props) {
  return(
    <li class='player-list-item'>
        <div className='player-ready-icon'>👍</div>
        <h2 className='player-text'>{props.player_name}</h2>
    </li>
  );
}

function ReadyText(props) {
  return (
      <h3 className='ready-text'>{props.ready_player_count}/{props.player_limit} Ready</h3>
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
