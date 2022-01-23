import './SummaryScreen.css';

// View
function SummaryScreen(props) {
    let winner = 'daxter'
    let winning_phrase = 'Salty and unsteady wounds the face'
    return (
        <section className='summary-container game-page-container'> 
            <h1>The winner is:</h1>
            <h2>{winner}</h2>
            <h3 className='type-handwriting'>{winning_phrase}</h3>
            <button className='button'>Play again</button>
        </section>
    )
}

export default SummaryScreen;