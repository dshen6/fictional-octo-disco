import React from 'react';

class CountdownTimer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeLeft: props.currentScreenTimer
        }
    }

    componentDidMount() {
        this.timerID = setInterval(
          () => this.tick(),
          1000
        )
    }

    tick() {
        this.setState(function(state, props) {
            if (state.timeLeft > 0) {
                return {
                timeLeft: state.timeLeft - 1
                }
            } else {
                clearInterval(this.timerID)
            }
        })
    }

    render() {
        return (
            <div className='countdown-timer-container type-handwriting'>&#9203; {this.state.timeLeft}</div>
        )
    }
}

export default CountdownTimer;