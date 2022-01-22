import './Gameplay.css';

// View
function Gameplay () {
    // todo: avatars carried over? colors?
    const player_names = ['jax', 'daxter','ratchet','clank']

    // todo: rename?
    const phrase = 'Slow and steady wins the race'

    let player_cards = ['Swap', 'Invert', 'Troll', 'Subvert']
    // todo: timer, add message to wait for troll phase

    return (
        <section> 
            Your phrase:
            <WordCardRow phrase={phrase}/>

            Choose a card:
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
          {word_cards}
      </div>
    );
}

// Singular word
function WordCard (props) {
    return(
        <button className='word-card'>
            <span className='word-card-word'>
              {props.word}
              <CardWordInput/>
            </span>
        </button>
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
      <div className='player-card-row'>
          {player_cards}
      </div>
    );
}

// Singular card
function PlayerCard (props) {
    return(
        <button className='player-card'>
            <span className='player-card-word'>
              {props.card}
            </span>
        </button>
      )
}

export default Gameplay;
