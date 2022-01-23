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
        <section className='voting-container game-page-container'>
            <h1>Vote on your favorite phrase:</h1>
            <PlayerPhraseList player_phrases={player_phrases}/>
        </section>
    )
}

// List of phrases with vote option
function PlayerPhraseList (props) {
    const player_phrase_list = props.player_phrases.map((player_phrase,i) => <PlayerPhrase player_phrase={player_phrase} key={i}/>)
    return (
      <ul className='player-phrase-list list-unstyled'>
          {player_phrase_list}
      </ul>
    );
}

// Singular phrase
function PlayerPhrase (props) {
    return(
        <li className='player-phrase'>
            <h2>{props.player_phrase} <input type='button' className='button' value='&hearts;'/></h2>
        </li>
      )
}

export default VotingScreen;