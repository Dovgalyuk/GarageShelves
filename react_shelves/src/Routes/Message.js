import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { postBackend } from '../Backend'


export default class MessageRoute extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          userid: -1,
        };
    }

    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    
    handleSubmit = (event) => {
        event.preventDefault();

        postBackend('mail/message', {},
            { id: this.state.userid }
        );
    }

    render() {
        return (
            <>
              <div className="row">
                <div className="page-header">
                  <h1>Send a message</h1>
                </div>
              </div>
              {/* { this.state.error
                && <Row>
                     <Col>
                       <Alert variant="danger">
                         {this.state.error}
                       </Alert>
                     </Col>
                   </Row>
              } */}
              <form>
                <Row className="form-group">
                  <label className="col-2 control-label" htmlFor="userid">User</label>
                  <Col xs={10}>
                    <input className="form-control"
                           value={this.state.userid}
                           onChange={this.handleChange}
                           name="userid" id="userid" required/>
                  </Col>
                </Row>
                <Row className="form-group">
                  <Col xs={10} className="offset-2">
                    <Button variant="primary"
                      onClick={this.handleSubmit}
                    >
                      Send
                    </Button>
                  </Col>
                </Row>
              </form>
            </>
          );
    }
}
