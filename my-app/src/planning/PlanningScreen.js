import './PlanningScreen.css';
import CountdownTimer from '../components/CountdownTimer';
import { useState } from 'react';

// View
function PlanningScreen(props) {
    // todo: avatars carried over? colors?
    // const player_names = ['jax', 'daxter','ratchet','clank']

    const playerPhrase = props.phrases[props.currentPlayerId]
    // todo: timer, add message to wait for troll phase

    const trollCardExists = props.cards.includes('troll') // todo: maybe move this down

    let selectedWordIndex1, selectedWordIndex2
    let transformedWordText

    return (
        <section className='planning-container text-align-center'>
            <CountdownTimer currentScreenTimer={props.currentScreenTimer}/>
            <WordCardRow words={playerPhrase} />
            <PlayerCardRow playerCards={props.cards} trollCardExists={trollCardExists} />
        </section>
    )
}

/* TODOS:
1. Player selects card to use = currentSelectedCard
2. Player selects word to apply card to = selectedWordIndex1, selectedWordIndex2
3. Player performs action on word(s) = (change index of currentSelectedWords), replace currentSelectedWord1 for rewrite
CARDTYPES = SWAP, EDIT

name of card -> swap or edit type, pick word OR edit field if cardtype is edit

*/

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function WordCardRow(props) {
    // todo: remove any extra punctuation
    const wordCards = props.words.map((word, i) => <WordCard word={word} key={i}/>)
    return (
      <div className='word-card-row'>
          <h1>Make a win-worthy phrase using the cards below!</h1>
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
    // selected card index will be passed by function on the right
    const [selectedCardIndex, setSelectedCardIndex] = useState(-1)

    // todo: remove any extra punctuation
    const playerCards = props.playerCards.map((card, i) =>
        <PlayerCard card={card} key={i} onClick={e => setSelectedCardIndex(i)} />)

    // todo: clean up trollNote
    let trollNote

    if (props.trollCardExists) {
        trollNote = <p>Your troll card can't be played until you've completed your phrase.</p>
    }

    return (
        <section className='player-card-container'>
            <h1>Your cards</h1>
            {trollNote}
            <ul className='player-card-row list-unstyled'>
                {playerCards}
            </ul>
        </section>
    );
}

// Singular card
function PlayerCard(props) {

    
    let trollCardStatus

    if (props.card == 'troll') {
        trollCardStatus = {
            disabled: 'disabled'
        }
    }

    return(
        <li>
            <button className='player-card' {...trollCardStatus} onClick={props.onClick}>
                <h3 className='player-card-word'>
                {props.card}
                </h3>
            </button>
        </li>
      )
}

export default PlanningScreen;
