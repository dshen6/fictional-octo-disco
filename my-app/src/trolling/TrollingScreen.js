import './TrollingScreen.css';

// View
function TrollingScreen () {
    // todo: avatars carried over? colors?
    let player_phrases = [
        'face bready slow wonders the slow',
        'Salty and unsteady wounds the face',
        'Joe the steadiest wins and Loses',
        'Glow Relapse and and Face'
    ]
    // todo: walkthrough of cards applied

    return (
        <section className='trolling-container game-page-container'> 
            <h1>Troll time!</h1>
            <h2>Trolls, swap your words.</h2>
            <PlayerPhraseList player_phrases={player_phrases}/>
        </section>
    )
}

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function PlayerPhraseList (props) {
    const player_phrase_list = props.player_phrases.map((player_phrase,i) => <PlayerWordCardRow player_phrase={player_phrase} key={i}/>)
    return (
      <ol className='player-phrase-list'>
          {player_phrase_list}
      </ol>
    );
}

// Singular phrase
function PlayerWordCardRow (props) {
    // Need to split the phrase itself
    const split_words = props.player_phrase.split(' ')
    const word_cards = split_words.map((word,i) => <PhraseWordCard word={word} key={i}/>)
    return(
        <li className='player-phrase'>
            <ul className='list-unstyled player-phrase-row'>
                {word_cards}
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
