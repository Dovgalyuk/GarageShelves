import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import PropTypes from 'prop-types'

export default class SubmitButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activated:false,
        };
    }

    render() {
        return (
            <Button variant="primary"
                onClick={() => this.setState({activated:true},
                    this.props.onClick)}
                disabled={this.props.disabled || this.state.activated}>
                {this.props.caption}
            </Button>
        );
    }
}

SubmitButton.defaultProps = {
    disabled: false,
}

SubmitButton.propTypes = {
    caption: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
}
