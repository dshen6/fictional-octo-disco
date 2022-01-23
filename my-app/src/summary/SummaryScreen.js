import './SummaryScreen.css';

// View
function SummaryScreen(props) {
    let winner = 'daxter'

    return (
        <section className='summary-container text-align-center game-page-container'>
            <h1>The winner is:</h1>
            <h2>{winner}</h2>
            <button className='button'>Play again</button>
        </section>
    )
}

export default SummaryScreen;