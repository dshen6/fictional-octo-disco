import './SummaryScreen.css';

// View
function SummaryScreen () {
    let winner = 'daxter'
    let winning_phrase = 'Salty and unsteady wounds the face'
    return (
        <section className='summary-container'> 
            <h1>The winner is:</h1>
            <h2>{winner}</h2>
            <p><span className='quotes'>&ldquo;</span>{winning_phrase}<span className='quotes'>&rdquo;</span></p>
            <button>Play again</button>
        </section>
    )
}

export default SummaryScreen;