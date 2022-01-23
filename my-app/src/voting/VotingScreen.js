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
            setSelectedPhraseIndex={setSelectedPhraseIndex}
            votes={props.votes}/>
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
        phraseVotes={props.votes[i]}
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
    
    const playerVoteCount = props.phraseVotes ? [...Array(props.phraseVotes)].map((vote, i) => <VoteIcon key={i} />) : ''
    
    // TODO: figure out why it still returns a checkmark if there are zero votes

    return(
        <li className='player-phrase'>
            <h2 className='type-handwriting'>{props.playerPhrase.join(" ")} {playerVoteButton} {playerVoteCount} </h2>
        </li>
      )
}

function VoteIcon () {

    return (
        <span className="player-vote-icon">&#x2713;</span>
    )
}

export default VotingScreen;