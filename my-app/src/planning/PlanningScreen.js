import './PlanningScreen.css';
import CountdownTimer from '../components/CountdownTimer';
import { useEffect, useState } from 'react';

function PlanningScreen(props) {
    const playerPhrase = props.phrases[props.currentPlayerId]

    const [selectedCardIndex, setSelectedCardIndex] = useState(-1)
    const [selectedWordIndex1, setSelectedWordIndex1] = useState(-1)
    const [selectedWordIndex2, setSelectedWordIndex2] = useState(-1)
    const [stinkyIndex, setStinkyIndex] = useState(-1) // todo
    const [transformedText, setTransformedText] = useState("")

    const expectTwoSelections = props.cards[selectedCardIndex] === "swap" && selectedWordIndex1 > -1
    const expectTextInputAfterSingleSelect = ["rhyme", "invert", "subvert", "pump"].includes(props.cards[selectedCardIndex])
    const isDump = props.cards[selectedCardIndex] === ["dump"] // todo

    useEffect(() => {
        // trigger swap
        if (selectedWordIndex1 > -1 && selectedWordIndex2 > -1 && expectTwoSelections) {
            props.onUseCard(selectedCardIndex, selectedWordIndex1, selectedWordIndex2, -1, "", "")
        }
        // trigger dump
        if (isDump) {
            if (selectedWordIndex1 > -1) {
                props.onUseCard(selectedCardIndex, selectedWordIndex1, -1, -1, "", "delete")
            } else if (stinkyIndex > -1) {
                props.onUseCard(selectedCardIndex, stinkyIndex, -1, -1, "", "stinky")
            }
        }
    })

    return (
        <section className='planning-container text-align-center'>
            <CountdownTimer currentScreenTimer={props.currentScreenTimer}/>
            <WordCardRow words={playerPhrase}
                onSelectedWord1={setSelectedWordIndex1}
                onSelectedWord2={setSelectedWordIndex2}
                selectedWordIndex1={selectedWordIndex1}
                selectedWordIndex2={selectedWordIndex2}
                expectTwoSelections={expectTwoSelections}
                expectOneSelection={selectedCardIndex > -1}
                expectTextInputAfterSingleSelect={expectTextInputAfterSingleSelect && selectedWordIndex1 > -1}
                isDump={isDump}
                setTransformedText={setTransformedText}
                transformedText={transformedText}
                setStinkyIndex={setStinkyIndex}
                selectedCardIndex={selectedCardIndex}
                onUseCard={props.onUseCard}
                />
            <PlayerCardRow playerCards={props.cards}
                onSelectedCard={setSelectedCardIndex}
                selectedCardIndex={selectedCardIndex}
                setSelectedWordIndex1={setSelectedWordIndex1}
                setSelectedWordIndex2={setSelectedWordIndex2}
                setTransformedText={setTransformedText}
            />
        </section>
    )
}

/* Prompt */
// todo: remove any extra punctuation
function WordCardRow(props) {
    const wordCards = props.words.map((word, i) => {
        const isAlreadySelected = props.selectedWordIndex1 === i || props.selectedWordIndex2 === i
        const anotherCardSelectedAndExpectingAnother = props.expectTwoSelections && props.selectedWordIndex1 != i
        return <WordCard word={word} key={i}
            isSelected={isAlreadySelected}
            showInput={props.expectTextInputAfterSingleSelect && isAlreadySelected}
            onClick = {_ => {
                    if (isAlreadySelected) { return; }
                    if (anotherCardSelectedAndExpectingAnother) {
                        props.onSelectedWord2(i)
                    } else if (props.expectOneSelection) {
                        props.onSelectedWord1(i)
                    }
                }
            }
            onTextChange = {props.setTransformedText}
            transformedText = {props.transformedText}
            onSubmit = {e => {
                props.onUseCard(props.selectedCardIndex, props.selectedWordIndex1, -1, -1, props.transformedText, "")
            }
            }
        />}
    )
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
    const selectableClassName = props.isSelectable ? 'word-card-selectable' : ''
    const isSelectedClassName = props.isSelected ? 'word-card-selected' : ''
    return(
        <li className='word-card-list-item'>
            <div className={`word-card ${selectableClassName} ${isSelectedClassName}`} onClick={props.onClick}>
                <h2 className='word-card-word type-handwriting'>
                {props.word}
                {props.showInput && 
                    <CardWordInput 
                        onTextChange={props.onTextChange}
                        transformedText={props.transformedText}
                        onSubmit={props.onSubmit}
                    />
                }
                </h2>
            </div>
        </li>
      )
}
// add confirm input button
// Input for editing cards
function CardWordInput(props) {
    return (
        <div>
            <form className='word-form form-horizontal-layout' onSubmit={_ => props.onSubmit(props.transformedText)}>
                <input type='text' placeholder='Enter word' value={props.transformedText} onChange={e => props.onTextChange(e.target.value)}/>
                <button className='button' type='submit'>Done</button>
            </form>
        
        </div>
    )
}

/* Player cards */
// Show list of cards
function PlayerCardRow(props) {
    const playerCards = props.playerCards.map((card, i) =>
        <PlayerCard card={card} key={i}
            onClick={e => {
                props.onSelectedCard(i);
                if (props.selectedCardIndex !== -1) {
                    // if we picked a new card, erase previous selections
                    props.setSelectedWordIndex1(-1);
                    props.setSelectedWordIndex2(-1);
                    props.setTransformedText("")
                }
            }}
            isSelected={i == props.selectedCardIndex}/>)

    return (
        <section className='player-card-container'>
            <h1>Your cards</h1>
            {props.playerCards.includes('troll') && <p>Your troll card(s) will be used in the next stage, after everyone uses all their non-troll cards.</p>}
            <ul className='player-card-row list-unstyled'>
                {playerCards}
            </ul>
        </section>
    );
}

// Singular card
function PlayerCard(props) {
    let trollCardStatus = props.card == 'troll' ? 'disabled': null
    let isSelected = props.isSelected ? 'player-card-selected' : null
    return(
        <li>
            <button className={`player-card ${trollCardStatus} ${isSelected}`} onClick={props.onClick}>
                <h3 className='player-card-word'>
                {props.card}
                </h3>
            </button>
        </li>
      )
}
export default PlanningScreen;


