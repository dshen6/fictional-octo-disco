import './VotingScreen.css';
import { useState } from 'react';

// View
function VotingScreen(props) {
    const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(-1)
    const [playerHasVoted, setPlayerHasVoted] = useState(false)
    
    const playerPhrases = Object.keys(props.players).map(function(key){
        return props.phrases[key];
    });
    return (
        <section className='voting-container game-page-container'>
            <h1>Vote on your favorite phrase:</h1>
            <PlayerPhraseList playerPhrases={playerPhrases}
            selectedPhraseIndex={selectedPhraseIndex}
            playerHasVoted={playerHasVoted}
            setPlayerHasVoted={setPlayerHasVoted}
            setSelectedPhraseIndex={setSelectedPhraseIndex}/>
        </section>
    )
}

// List of phrases with vote option
function PlayerPhraseList(props) {
    console.log(props.playerHasVoted)
    const playerPhraseList = props.playerPhrases.map((phrase,i) =>
        <PlayerPhrase playerPhrase={phrase} key={i} phraseIndex={i} 
        playerHasVoted={props.playerHasVoted} 
        onSelectedPhrase={props.setSelectedPhraseIndex}
        setPlayerHasVoted={props.setPlayerHasVoted}
        selectedPhraseIndex={props.selectedPhraseIndex}
        />)

    return (
      <ul className='player-phrase-list list-unstyled'>
          {playerPhraseList}
      </ul>
    );
}

// Singular phrase
function PlayerPhrase(props) {
    let playerVoteButton = props.playerHasVoted ? '' : <input type='button' className='button' value='&hearts;' type='submit' onClick={e=> {
        props.setPlayerHasVoted(true)
        props.onSelectedPhrase(props.phraseIndex)
    }}/>
    let playerSelectionIcon = (props.phraseIndex == props.selectedPhraseIndex) ? '&#x2713' : ''

    return(
        <li className='player-phrase'>
            <h2 className='type-handwriting'>{props.playerPhrase.join(" ")} {playerVoteButton} {playerSelectionIcon}</h2>
        </li>
      )
}

export default VotingScreen;