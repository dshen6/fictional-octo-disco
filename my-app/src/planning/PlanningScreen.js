import './PlanningScreen.css';
import CountdownTimer from '../components/CountdownTimer';

// View
function PlanningScreen(props) {
    // todo: avatars carried over? colors?
    // const player_names = ['jax', 'daxter','ratchet','clank']

    const playerPhrase = props.phrases[props.currentPlayerId]
    // todo: timer, add message to wait for troll phase

    return (
        <section className='planning-container text-align-center'>
            <CountdownTimer currentScreenTimer={props.currentScreenTimer}/>
            <WordCardRow words={playerPhrase}/>
            <PlayerCardRow playerCards={props.cards}/>
        </section>
    )
}

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function WordCardRow(props) {
    // todo: remove any extra punctuation
    const wordCards = props.words.map((word, i) => <WordCard word={word} key={i}/>)
    return (
      <div className='word-card-row'>
          <h1>Your phrase:</h1>
          <ul className='list-unstyled list-horizontal'>
            {wordCards}
          </ul>
      </div>
    );
}

// Singular word
function WordCard(props) {
    return(
        <li className='word-card-list-item'>
            <button className='word-card'>
                <h2 className='word-card-word type-handwriting'>
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
function PlayerCardRow(props) {
    // todo: remove any extra punctuation
    const playerCards = props.playerCards.map((card, i) => <PlayerCard card={card} key={i}/>)
    return (
        <section className='player-card-container'>
            <h1>Choose a card:</h1>
            <ul className='player-card-row list-unstyled'>
                {playerCards}
            </ul>
        </section>
    );
}

// Singular card
function PlayerCard(props) {
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

export default PlanningScreen;
