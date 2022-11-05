import React from 'react';
import timerIcon from '../assets/hourglass.svg';

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

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (nextProps.currentScreenTimer !== this.props.currentScreenTimer) {
            this.setState({
                timeLeft: nextProps.currentScreenTimer
            })
        }
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
            <div className='countdown-timer-container type-handwriting'>
                <img src={timerIcon} className='timer-icon'/>
                {this.state.timeLeft}
            </div>
        )
    }
}

export default CountdownTimer;