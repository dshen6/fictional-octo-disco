import './TrollingScreen.css';
import CountdownTimer from '../components/CountdownTimer';
import ErrorMessage from '../components/ErrorMessage';
import { useEffect, useState } from 'react';

// View
function TrollingScreen(props) {

    const [selectedWordIndex1, setSelectedWordIndex1] = useState(-1)
    const [selectedWordIndex2, setSelectedWordIndex2] = useState(-1)
    const [selectedPlayerId1, setSelectedPlayerId1] = useState(-1)
    const [selectedPlayerId2, setSelectedPlayerId2] = useState(-1)

    const clearSelection = function() {
        setSelectedPlayerId1(-1)
        setSelectedPlayerId2(-1)
        setSelectedWordIndex1(-1)
        setSelectedWordIndex2(-1)
    };

    useEffect(() => {
        const areSelectedPlayersDifferent = selectedPlayerId1 !== selectedPlayerId2;
        const isValidSwap = selectedWordIndex1 > -1 && selectedWordIndex2 > -1 && areSelectedPlayersDifferent;
        if (isValidSwap) {
            clearSelection()
            props.onUseCard(null, selectedWordIndex1, selectedWordIndex2, selectedPlayerId1, selectedPlayerId2, "", "")
        } else if (selectedPlayerId1 === selectedPlayerId2 && selectedPlayerId1 > -1) {
            clearSelection() // reset selection so they can try again
        }
    },[selectedPlayerId1, selectedPlayerId2, props, selectedWordIndex1, selectedWordIndex2] );

    const isMyTurnToTroll = props.currentPlayerTrollTurnId === props.currentPlayerId;
    const nameOfTrollingPlayer = props.players[props.currentPlayerTrollTurnId];
    const helperText = isMyTurnToTroll ? 
        "It's your turn to troll a player. Pick one word from any other player, and swap with one of your words." :
        `${nameOfTrollingPlayer} is thinking about who to troll...`;

    return (
        <section className='trolling-container game-page-container'> 
            <h1>Troll time!</h1>
            <div>
                <h2>{helperText}</h2>
                <CountdownTimer currentScreenTimer={props.currentScreenTimer}/>
            </div>
            <ErrorMessage error={props.useCardError}/>
            <PlayerPhraseList phrases={props.phrases}
                setSelectedWordIndex1={setSelectedWordIndex1}
                setSelectedWordIndex2={setSelectedWordIndex2}
                selectedWordIndex1={selectedWordIndex1}
                selectedWordIndex2={selectedWordIndex2}
                setSelectedPlayerId1={setSelectedPlayerId1}
                setSelectedPlayerId2={setSelectedPlayerId2}
                selectedPlayerId1={selectedPlayerId1}
                selectedPlayerId2={selectedPlayerId2}
                enabled={isMyTurnToTroll}
                lockedWords={props.lockedWords}/>
        </section>
    )
}

/* ----- Components in view ----- */

/* Prompt */
// Break word into pieces
function PlayerPhraseList(props) {
    const playerPhraseList = Object.keys(props.phrases).map(function(key){
        return <PlayerWordCardRow phrase={props.phrases[key]} key={key} playerId={key}
            setSelectedWordIndex1={props.setSelectedWordIndex1}
            setSelectedWordIndex2={props.setSelectedWordIndex2}
            selectedWordIndex1={props.selectedWordIndex1}
            selectedWordIndex2={props.selectedWordIndex2}
            setSelectedPlayerId1={props.setSelectedPlayerId1}
            setSelectedPlayerId2={props.setSelectedPlayerId2}
            selectedPlayerId1={props.selectedPlayerId1}
            selectedPlayerId2={props.selectedPlayerId2}
            enabled={props.enabled}
            lockedWords={props.lockedWords}/>
    })
    return (
      <ol className='player-phrase-list'>
          {playerPhraseList}
      </ol>
    );
}

// Singular phrase
function PlayerWordCardRow(props) {
    const words = props.phrase.map((word,i) => {
        const onClick = function() {
            if (props.selectedWordIndex1 === -1) {
                props.setSelectedWordIndex1(i)
                props.setSelectedPlayerId1(props.playerId)
            } else {
                props.setSelectedWordIndex2(i)
                props.setSelectedPlayerId2(props.playerId)
            }
        };
        const lockedWordIndices = props.lockedWords[props.playerId] || []
        const isLocked = lockedWordIndices.includes(i)
        const isSelected = (props.playerId === props.selectedPlayerId1 && props.selectedWordIndex1 === i) || 
        (props.playerId === props.selectedPlayerId2 && props.selectedWordIndex2 === i)
        return <PhraseWordCard word={word} 
            key={i}
            onClick= {onClick}
            isSelected= {isSelected}
            enabled= {props.enabled && !isLocked} />;
    });
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
    const isSelectedClassName = props.isSelected ? 'word-card-selected' : ''
    return (
        <li className='player-phrase-word'>
            <button className={`word-card ${isSelectedClassName}`} onClick={props.onClick} disabled={!props.enabled}>
                <h3 className='word-card-word type-handwriting'>
                {props.word}
                </h3>
            </button>
        </li>
    )
}

export default TrollingScreen;
