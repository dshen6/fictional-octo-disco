import './ResultsScreen.css';

// View
function ResultsScreen(props) {
    let mostVotes = 0

    Object.entries(props.votes).forEach( entry => {
        const [user, votes] = entry

        if (votes > mostVotes) {
            mostVotes = votes
        }
    })

    let winningPlayerIds = []
    Object.entries(props.votes).forEach( entry => {
        const [user, votes] = entry

        if (votes === mostVotes) {
            winningPlayerIds.push(user)
        }
    })

    const winnerName = props.players[winningPlayerIds[0]]
    const winningPhrase = props.phrases[winningPlayerIds[0]].join(' ')

    return (
        <section className='results-container text-align-center game-page-container'>
            <h1>This round's winner is:</h1>
            <h2>{winnerName}</h2>
            <h3 className='type-handwriting'>{winningPhrase}</h3>
        </section>
    )
}

export default ResultsScreen;