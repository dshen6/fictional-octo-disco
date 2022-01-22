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
        <section> 
            <PlayerPhraseList player_phrases={player_phrases}/>
        </section>
    )
}

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function PlayerPhraseList (props) {
    const player_phrase_list = props.player_phrases.map(player_phrase => <PlayerWordCardRow player_phrase={player_phrase} key={player_phrase}/>)
    return (
      <div className='player-phrase-list'>
          {player_phrase_list}
      </div>
    );
}

// Singular phrase
function PlayerWordCardRow (props) {
    // Need to split the phrase itself
    const split_words = props.player_phrase.split(' ')
    const word_cards = split_words.map(word => <PhraseWordCard word={word} key={word}/>)
    return(
        <section className='player-phrase'>
            {word_cards}
        </section>
      )
}

// Singular word in phrase
function PhraseWordCard(props) {
    // TODO: swap mechanic
    return (
        <button className='word-card'>
            <span className='word-card-word'>
              {props.word}
            </span>
        </button>
    )
}

export default TrollingScreen;
