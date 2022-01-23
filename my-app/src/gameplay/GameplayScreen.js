import './GameplayScreen.css';

// View
function GameplayScreen () {
    // todo: avatars carried over? colors?
    const player_names = ['jax', 'daxter','ratchet','clank']

    // todo: rename?
    const phrase = 'Slow and steady wins the race'

    let player_cards = ['Swap', 'Invert', 'Troll', 'Subvert']
    // todo: timer, add message to wait for troll phase

    return (
        <section className='gameplay-container text-align-center'>
            <WordCardRow phrase={phrase}/>
            <PlayerCardRow player_cards={player_cards}/>
        </section>
    )
}

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function WordCardRow (props) {
    // todo: remove any extra punctuation
    const split_words = props.phrase.split(' ')
    const word_cards = split_words.map(word => <WordCard word={word} key={word}/>)
    return (
      <div className='word-card-row'>
          <h1>Your phrase:</h1>
          <ul className='list-unstyled list-horizontal'>
            {word_cards}
          </ul>
      </div>
    );
}

// Singular word
function WordCard (props) {
    return(
        <li className='word-card-list-item'>
            <button className='word-card'>
                <h2 className='word-card-word'>
                {props.word}
                <CardWordInput/>
                </h2>
            </button>
        </li>
      )
}

// Input for editing cards
function CardWordInput() {
    // TODO: only show when word has edit card applied to it
    return (
        <div>
        <input type='text' placeholder='Enter word'/>
        </div>
    )
}

// TODO: Select word card???

/* Player cards */
// Show list of cards
function PlayerCardRow (props) {
    // todo: remove any extra punctuation
    const player_cards = props.player_cards.map(card => <PlayerCard card={card} key={card}/>)
    return (
        <section class='player-card-container'>
            <h1>Choose a card:</h1>
            <ul className='player-card-row list-unstyled'>
                {player_cards}
            </ul>
        </section>
    );
}

// Singular card
function PlayerCard (props) {
    return(
        <li>
            <button className='player-card'>
                <h3 className='player-card-word'>
                {props.card}
                </h3>
            </button>
        </li>
      )
}

export default GameplayScreen;
