import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import * as queryString from 'query-string'
import { postBackend } from '../Backend'


export default class ConfirmEmail extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          error: null,
          alert: "Please wait for server reply.",
        };
    }

    componentDidMount() {
        var params = queryString.parse(this.props.location.search);
        postBackend('auth/confirm_email', {},
            {email: params.email, h: params.h})
        .then(response => response.json())
        .then(response => {
            if (response.error) {
                this.setState({error:response.error, alert:null});
            } else {
                this.setState({alert:"Your email was successfully confirmed. Now you can login.", error:null});
            }
        })
        .catch();
    }

    render() {
        return (
          <>
            { this.state.alert
            && <Row>
                <Col>
                    <Alert variant="primary">
                        {this.state.alert}
                    </Alert>
                </Col>
                </Row>
            }
            { this.state.error
            && <Row>
                <Col>
                    <Alert variant="danger">
                        {this.state.error}
                    </Alert>
                </Col>
                </Row>
            }
          </>
        );
    }
}
