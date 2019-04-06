import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import fetchBackend from './Backend'

export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alert: null,
      login: "",
      password: "",
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    fetchBackend('auth/_login', this.state)
        .then(response => response.json())
        .then(response => {
            if (response.user_id > 0) {
                this.props.auth.userHasAuthenticated(true);
                this.props.history.push("/");
            } else {
                throw new Error();
            }
        })
        .catch(e => this.setState({alert:'Invalid login/password'}));
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="page-header">
            <h1>Log in</h1>
          </div>
        </div>
        { this.state.alert
          && <Row>
               <Col>
                 <Alert variant="danger">
                   {this.state.alert}
                 </Alert>
               </Col>
             </Row>
        }
        <form>
          <div className="form-group row">
            <label className="col-2 control-label" htmlFor="login">Login</label>
            <div className="col-10">
              <input className="form-control" name="login" id="login"
                     value={this.state.login}
                     onChange={this.handleChange}
                     required />
            </div>
          </div>
          <div className="form-group row">
            <label className="col-2 control-label" htmlFor="password">Password</label>
            <div className="col-10">
              <input className="form-control" type="password"
                     value={this.state.password}
                     onChange={this.handleChange}
                     name="password" id="password" required />
            </div>
          </div>
          <div className="form-group row">
            <div className="offset-2 col-10">
              <Button variant="primary" onClick={this.handleSubmit}>
                Log in
              </Button>
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default Login
