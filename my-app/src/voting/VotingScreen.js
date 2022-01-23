import './VotingScreen.css';
import { useState } from 'react';

// View
function VotingScreen(props) {
    const playerPhrases = Object.keys(props.players).map(function(key){
        return props.phrases[key];
    });
    return (
        <section className='voting-container game-page-container'>
            <h1>Vote on your favorite phrase:</h1>
            <PlayerPhraseList playerPhrases={playerPhrases}/>
        </section>
    )
}

// List of phrases with vote option
function PlayerPhraseList(props) {
    const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(-1)
    const [playerHasVoted, setPlayerHasVoted] = useState(false)

    const playerPhraseList = props.playerPhrases.map((phrase,i) =>
        <PlayerPhrase playerPhrase={phrase} key={i} phraseIndex={i} playerHasVoted={playerHasVoted} onClick={e => {
            setSelectedPhraseIndex(i)
            selectedPhraseIndex > -1 ? setPlayerHasVoted(true) : setPlayerHasVoted(false)
            console.log('index: ', i)
            console.log('selected phrase index: ', selectedPhraseIndex)
        }}/>)

    return (
      <ul className='player-phrase-list list-unstyled'>
          {playerPhraseList}
      </ul>
    );
}

// Singular phrase
function PlayerPhrase(props) {
    let playerVoteButton = /* props.playerHasVoted ? '' : */ <input type='button' className='button' value='&hearts;' onClick={props.onClick}/>
    let playerSelectionIcon = (props.phraseIndex == props.selectedPhraseIndex) ? '&#x2713' : ''

    return(
        <li className='player-phrase'>
            <h2 className='type-handwriting'>{props.playerPhrase.join(" ")} {playerVoteButton} {playerSelectionIcon}</h2>
        </li>
      )
}

export default VotingScreen;