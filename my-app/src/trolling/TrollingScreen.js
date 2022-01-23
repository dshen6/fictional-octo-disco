import './TrollingScreen.css';

// View
function TrollingScreen(props) {
    // todo: avatars carried over? colors?
    const playerPhrases = Object.keys(props.players).map(function(key){
        return props.phrases[key];
      });
    console.log(playerPhrases.length)
    // todo: walkthrough of cards applied

    return (
        <section className='trolling-container game-page-container'> 
            <h1>Troll time!</h1>
            <h2>Trolls, swap your words.</h2>
            <PlayerPhraseList playerPhrases={playerPhrases}/>
        </section>
    )
}

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function PlayerPhraseList(props) {
    const playerPhraseList = props.playerPhrases.map((phrase,i) => <PlayerWordCardRow phrase={phrase} key={i}/>)
    return (
      <ol className='player-phrase-list'>
          {playerPhraseList}
      </ol>
    );
}

// Singular phrase
function PlayerWordCardRow(props) {
    const words = props.phrase.map((word,i) => <PhraseWordCard word={word} key={i}/>)
    return(
        <li className='player-phrase'>
            <ul className='list-unstyled player-phrase-row'>
                {words}
            </ul>
        </li>
      )
}

// Singular word in phrase
function PhraseWordCard(props) {
    // TODO: swap mechanic
    return (
        <li className='player-phrase-word'>
            <button className='word-card'>
                <h3 className='word-card-word'>
                {props.word}
                </h3>
            </button>
        </li>
    )
}

export default TrollingScreen;
