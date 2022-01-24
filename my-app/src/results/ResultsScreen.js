import './ResultsScreen.css';

// View
function ResultsScreen(props) {
    let mostVotes = 0
    let proposedWinner = {}

    Object.entries(props.votes).forEach( entry => {
        const [user, votes] = entry

        if (votes > mostVotes) {
            mostVotes = votes
            proposedWinner = Object.entries(props.votes)[user]
        }
    })

    // TODO: tie scenarios

    const finalWinner = proposedWinner
    const winnerName = props.players[proposedWinner[0]]
    const winningPhrase = props.phrases[proposedWinner[0]].join(' ')

    return (
        <section className='results-container text-align-center game-page-container'>
            <h1>This round's winner is:</h1>
            <h2>{winnerName}</h2>
            <h3 className='type-handwriting'>{winningPhrase}</h3>
        </section>
    )
}

export default ResultsScreen;