import './LobbyScreen.css';

function LobbyScreen() {
  const player_names = ['jax', 'daxter','ratchet','clank']
  const player_limit = 4
  return (
    <section className='lobby-container'>
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
    <ul className='player-list'>
        {player_icons}
    </ul>
  );
}

function PlayerIcon(props) {
  return(
    <li>
        <span>👍 </span>
        <span className='ready-text'>
          <h2>{props.player_name}</h2>
        </span>
    </li>
  );
}

function ReadyText(props) {
  return (
      <span className='ready-text'>
        <h3>{props.ready_player_count}/{props.player_limit} Ready</h3>
      </span>
  );
}

function ReadyButton() {
  return (
    <div className='ready-section'>
      <button>Start Game</button>
    </div>
  )
}

function NameInput() {
  return (
    <section className='player-name-form'>
      <input type='text' placeholder='Enter name'/>
      <NameInputEnter />
    </section>
  )
}
  
function NameInputEnter() {
  return (
    <div>
      <button>Ready</button>
    </div>
  )
}

export default LobbyScreen;
