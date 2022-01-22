import './LobbyScreen.css';

function LobbyScreen() {
  const player_names = ['jax', 'daxter','ratchet','clank']
  return (
    <section className='lobby-container'>
      <PlayerIconRow player_names={player_names}/>
      <ReadyText ready_player_count='4'/>
      <ReadyButton />
      <NameInput />
      <NameInputEnter />
    </section>
  )
}

function PlayerIconRow(props) {
  // Map function: For name in player names, spit it out into player icon
  const player_icons = props.player_names.map(name => <PlayerIcon player_name={name} key={name}/>)
  return (
    <div className='player-icon-row'>
        {player_icons}
    </div>
  );
}

function PlayerIcon(props) {
  return(
    <div>
        <span>👍 </span>
        <span className='ready-text'>
          {props.player_name}
        </span>
    </div>
  );
}

function ReadyText(props) {
  return (
      <span className='ready-text'>
        {props.ready_player_count}/8 Ready
      </span>
  );
}

function ReadyButton() {
  return (
    <div className='ready-btn'>
      <button >Start Game</button>
    </div>
  )
}

function NameInput() {
  return (
    <div>
      <input type='text' placeholder='Enter name'/>
    </div>
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
