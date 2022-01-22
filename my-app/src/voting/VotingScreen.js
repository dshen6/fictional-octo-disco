import './VotingScreen.css';

// View
function VotingScreen () {
    let player_phrases = [
        'face bready slow wonders the slow',
        'Salty and unsteady wounds the face',
        'Joe the steadiest wins and Loses',
        'Glow Relapse and and Face'
    ]

    return (
        <section>
            <h1>Vote on your favorite phrase:</h1>
            <PlayerPhraseList player_phrases={player_phrases}/>
        </section>
    )
}

// List of phrases with vote option
function PlayerPhraseList (props) {
    const player_phrase_list = props.player_phrases.map(player_phrase => <PlayerPhrase player_phrase={player_phrase} key={player_phrase}/>)
    return (
      <div className='player-phrase-list'>
          {player_phrase_list}
      </div>
    );
}

// Singular phrase
function PlayerPhrase (props) {
    return(
        <section className='player-phrase'>
            <div className='player'>{props.player_phrase}</div>
            <input type='button' value='Vote'/>
        </section>
      )
}

export default VotingScreen;