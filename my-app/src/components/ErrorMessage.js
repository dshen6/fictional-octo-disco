import React from 'react';

class ErrorMessage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.error.length) {
            return (
                <h3 className='error-message'>{this.props.error}</h3>
            )
        } else {
            return null;
        }
    }
}

export default ErrorMessage;