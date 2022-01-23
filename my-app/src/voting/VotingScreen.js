import './VotingScreen.css';

// View
function VotingScreen(props) {
    const playerPhrases = Object.keys(props.players).map(function(key){
        return props.phrases[key];
    });
    return (
        <section className='voting-container game-page-container'>
            <h1>Vote on your favorite phrase:</h1>
            <PlayerPhraseList playerPhrases={playerPhrases}/>
        </section>
    )
}

// List of phrases with vote option
function PlayerPhraseList(props) {
    const playerPhraseList = props.playerPhrases.map((phrase,i) => <PlayerPhrase playerPhrase={phrase} key={i}/>)
    return (
      <ul className='player-phrase-list list-unstyled'>
          {playerPhraseList}
      </ul>
    );
}

// Singular phrase
function PlayerPhrase(props) {
    return(
        <li className='player-phrase'>
            <h2 className='type-handwriting'>{props.playerPhrase.join(" ")} <input type='button' className='button' value='&hearts;'/></h2>
        </li>
      )
}

export default VotingScreen;