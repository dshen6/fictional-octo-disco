import './ResultsScreen.css';

// View
function ResultsScreen(props) {
    let mostVotes = 0

    Object.entries(props.votes).forEach( entry => {
        const [, votes] = entry

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

    const hasSingleWinner = winningPlayerIds.length === 1
    if (hasSingleWinner) {
        const winnerName = props.players[winningPlayerIds[0]]
        const winningPhrase = props.phrases[winningPlayerIds[0]].join(' ')
    
        return (
            <section className='results-container text-align-center game-page-container'>
                <h1>This round's winner is:</h1>
                <Winner winnerName={winnerName} winningPhrase = {winningPhrase}/>
            </section>
        )
    } else {
        const winners = winningPlayerIds.map(id => {
            const winningPhrase = props.phrases[id].join(' ')
        return <Winner winnerName={props.players[id]} winningPhrase = {winningPhrase} key={id}/>
        })
        return (
            <section className='results-container text-align-center game-page-container'>
                <h1>This round's winners are:</h1>
                {winners}
            </section>
        )
    }

    // Single Winner
function Winner(props) {
    return (
        <div className='winner-item'>
            <h2>{props.winnerName}</h2>
            <h3 className='type-handwriting'>{props.winningPhrase}</h3>
        </div>
      );
    }
}

export default ResultsScreen;