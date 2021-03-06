import './PlanningScreen.css';
import CountdownTimer from '../components/CountdownTimer';
import ErrorMessage from '../components/ErrorMessage';
import { useEffect, useState } from 'react';

function PlanningScreen(props) {
    const playerPhrase = props.phrases[props.currentPlayerId] || []

    const [selectedCardIndex, setSelectedCardIndex] = useState(-1)
    const [selectedWordIndex1, setSelectedWordIndex1] = useState(-1)
    const [selectedWordIndex2, setSelectedWordIndex2] = useState(-1)
    const [stinkyIndex, setStinkyIndex] = useState(-1) // todo
    const [transformedText, setTransformedText] = useState("")

    const expectTwoSelections = props.cards[selectedCardIndex] === "swap" && selectedWordIndex1 > -1
    const expectTextInputAfterSingleSelect = ["rhyme", "invert", "subvert", "pump"].includes(props.cards[selectedCardIndex])
    const isDump = props.cards[selectedCardIndex] === "dump" // todo

    const clearSelection = function() {
        setSelectedCardIndex(-1)
        setSelectedWordIndex1(-1)
        setSelectedWordIndex2(-1)
        setStinkyIndex(-1)
        setTransformedText("")
    };

    const cardDescriptions = {
        "rhyme" : "Replace a word with another that rhymes.",
        "invert" : "Replace a word with one that means the opposite.",
        "subvert" : "Replace a word with one that begins and ends with the same letters.",
        "swap" : "Choose two words and swap their positions.", 
        "pump" : "Replace a word with one that is similar in meaning but more powerful.",
        "dump" : "Drop a word of your choice.",
        "troll" : "Choose two words that belong to different players and swap their positions." 
    }

    useEffect(() => {
        // trigger swap
        if (selectedWordIndex1 > -1 && selectedWordIndex2 > -1 && expectTwoSelections) {
            clearSelection()
            props.onUseCard(selectedCardIndex, selectedWordIndex1, selectedWordIndex2, -1, -1, "", "")
            return
        }
        // trigger dump
        if (isDump) {
            if (selectedWordIndex1 > -1) {
                clearSelection()
                props.onUseCard(selectedCardIndex, selectedWordIndex1, -1, -1, -1, "", "delete")
                return
            } else if (stinkyIndex > -1) {
                clearSelection()
                props.onUseCard(selectedCardIndex, stinkyIndex, -1, -1, -1,"", "stinky")
                return
            }
        }
    });

    return (
        <section className='planning-container text-align-center'>
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
                clearSelection={clearSelection}
                />
            <CountdownTimer currentScreenTimer={props.currentScreenTimer}/>
            <ErrorMessage error={props.useCardError}/>
            <PlayerCardRow playerCards={props.cards}
                onSelectedCard={setSelectedCardIndex}
                selectedCardIndex={selectedCardIndex}
                setSelectedWordIndex1={setSelectedWordIndex1}
                setSelectedWordIndex2={setSelectedWordIndex2}
                setTransformedText={setTransformedText}
                cardDescriptions={cardDescriptions}
            />
        </section>
    )
}

/* Prompt */
// todo: remove any extra punctuation
function WordCardRow(props) {
    const wordCards = props.words.map((word, i) => {
        const isAlreadySelected = props.selectedWordIndex1 === i || props.selectedWordIndex2 === i
        const anotherCardSelectedAndExpectingAnother = props.expectTwoSelections && props.selectedWordIndex1 !== i
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
            isSelectable={props.selectedCardIndex > -1}
            onTextChange = {props.setTransformedText}
            transformedText = {props.transformedText}
            onSubmit = {_ => {
                props.onUseCard(props.selectedCardIndex, props.selectedWordIndex1, -1, -1, -1, props.transformedText, "")
                props.clearSelection()
            }}
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
    const isTextChangeClassName = props.showInput ? 'word-card-replace' : ''
    return(
        <li className='word-card-list-item'>
            <div className={`word-card ${selectableClassName} ${isSelectedClassName} ${isTextChangeClassName}`} onClick={props.onClick}>
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
    const isSendEnabled = props.transformedText.length > 0
    return (
        <div>
            <form className='word-form' onSubmit={e => {
                e.preventDefault();
                if (isSendEnabled) {
                    props.onSubmit(props.transformedText);
                }
            }
            }>
                <input autoFocus type='text' placeholder='Enter word' value={props.transformedText} onChange={e => props.onTextChange(e.target.value)}/>
                <button className='button' type='submit' disabled={!isSendEnabled}>Done</button>
            </form>
        </div>
    )
}

/* Player cards */
// Show list of cards
function PlayerCardRow(props) {
    const playerCards = props.playerCards.map((card, i) =>
        <PlayerCard card={card} key={i} cardDescription={props.cardDescriptions[card]}
            onClick={e => {
                props.onSelectedCard(i);
                if (props.selectedCardIndex !== -1) {
                    // if we picked a new card, erase previous selections
                    props.setSelectedWordIndex1(-1);
                    props.setSelectedWordIndex2(-1);
                    props.setTransformedText("")
                }
            }}
            isSelected={i === props.selectedCardIndex}/>)

    return (
        <section className='player-card-row-container'>
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
    let trollCardStatus = props.card === 'troll' ? 'disabled': ''
    let isSelected = props.isSelected ? 'player-card-selected' : ''

    const [isFlipped, flipCard] = useState(false);

    const triggerCardFlip = () => {
        flipCard( !isFlipped )
    }

    return(
        <li className='player-card-container'>
            <button className={`player-card player-card-${props.card} ${trollCardStatus} ${isSelected} ${isFlipped ? 'player-card-flipped' : ''}`}
                    onClick={props.onClick}
                    data-title={`${props.card.toUpperCase()}`}
                    data-description={`${props.cardDescription}`}
                    >
                <h3 className='player-card-word'>
                </h3>
            </button>
            <button className={`button help-button ${isFlipped ? 'help-button-selected' : ''}`} onClick={triggerCardFlip}>?</button>
        </li>
      )
}
export default PlanningScreen;


