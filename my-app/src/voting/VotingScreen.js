import './VotingScreen.css';
import CountdownTimer from '../components/CountdownTimer';
import { useState } from 'react';

// View
function VotingScreen(props) {
    const [playerHasVoted, setPlayerHasVoted] = useState(false)
    
    return (
        <section className='voting-container game-page-container'>
            <CountdownTimer currentScreenTimer={props.currentScreenTimer}/>
            <h1>Vote on your favorite phrase:</h1>
            <PlayerPhraseList phrases={props.phrases}
            currentPlayerId={props.currentPlayerId}
            playerHasVoted={playerHasVoted}
            setPlayerHasVoted={setPlayerHasVoted}
            votes={props.votes}
            onVote={props.onVote}
            />
        </section>
    )
}

// List of phrases with vote option
function PlayerPhraseList(props) {
    const playerPhraseList = Object.entries(props.phrases).map(([playerId, phrase]) => {
        if (parseInt(playerId) !== parseInt(props.currentPlayerId)) {
            return <PlayerPhrase playerPhrase={phrase} key={playerId}
                playerId={playerId}
                playerHasVoted={props.playerHasVoted} 
                setPlayerHasVoted={props.setPlayerHasVoted}
                phraseVotes={props.votes[playerId] || 0}
                onVote={props.onVote}
                />
        } else {
            return null;
        }
    }).filter(it => it !== null)

    return (
      <ul className='player-phrase-list list-unstyled'>
          {playerPhraseList}
      </ul>
    );
}

// Singular phrase
function PlayerPhrase(props) {
    let playerVoteButton = props.playerHasVoted ? '' : <input type='button' className='button' value='&hearts;' onClick={e=> {
        props.setPlayerHasVoted(true)
        props.onVote(props.playerId)
    }}/>
    const playerVoteCount = props.phraseVotes ? [...Array(props.phraseVotes)].map((vote, i) => <VoteIcon key={i} />) : ''
    
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