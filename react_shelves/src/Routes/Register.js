import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { postBackend } from '../Backend'

export class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alert: null,
      error: null,
      email: "",
      username: "",
      collection_title: "",
      collection_desc: "",
      password1: "",
      password2: "",
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const { email, username, collection_title, collection_desc,
            password1 } = this.state;

    postBackend('auth/register', {},
      {
        email: email, username: username, password: password1,
        collection_title: collection_title,
        collection_desc: collection_desc,
      })
        .then(response => response.json())
        .then(response => {
            if (response.error) {
                this.setState({error:response.error, alert:null});
                //this.props.auth.userHasAuthenticated(true);
            } else {
                this.setState({alert:"Registration successful", error:null});
            }
        })
        .catch();
  }

  invalidName = () => {
    return false;
  }

  invalidEmail = () => {
    return false;
  }

  invalidPassword = () => {
    return this.state.password1.trim().length === 0
        || this.state.password1 !== this.state.password2;
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="page-header">
            <h1>Registration</h1>
          </div>
        </div>
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
        <form>
          <div className="form-group row">
            <label className="col-2 control-label" htmlFor="email">E-mail</label>
            <div className="col-10">
              <input className="form-control" name="email" id="email"
                     value={this.state.email}
                     onChange={this.handleChange}
                     required />
            </div>
          </div>
          <Row className="form-group">
            <label className="col-2 control-label" htmlFor="username">Display name</label>
            <Col xs={10}>
              <input className="form-control"
                     value={this.state.username}
                     onChange={this.handleChange}
                     name="username" id="username" required/>
            </Col>
          </Row>
          <div className="form-group row">
            <label className="col-2 control-label" htmlFor="password1">Password</label>
            <div className="col-10">
              <Form.Control type="password"
                     value={this.state.password1}
                     onChange={this.handleChange}
                     isInvalid={this.invalidPassword()}
                     name="password1" id="password1"/>
            </div>
          </div>
          <Row className="form-group">
            <label className="col-2 control-label" htmlFor="password2">Repeat password</label>
            <Col xs={10}>
              <Form.Control type="password"
                     value={this.state.password2}
                     onChange={this.handleChange}
                     isInvalid={this.invalidPassword()}
                     name="password2" id="password2"/>
            </Col>
          </Row>
          <Row className="form-group">
            <label className="col-2 control-label" htmlFor="collection_title">Collection name</label>
            <Col xs={10}>
              <input className="form-control"
                     value={this.state.collection_title}
                     onChange={this.handleChange}
                     name="collection_title" id="collection_title" required/>
            </Col>
          </Row>
          <Row className="form-group">
            <label className="col-2 control-label" htmlFor="collection_desc">Collection description</label>
            <Col xs={10}>
              <textarea className="form-control" rows={4}
                     value={this.state.collection_desc}
                     onChange={this.handleChange}
                     name="collection_desc" id="collection_desc"/>
            </Col>
          </Row>
          <div className="form-group row">
            <div className="offset-2 col-10">
              <Button variant="primary"
                onClick={this.handleSubmit}
                disabled={this.invalidPassword() || this.invalidName()
                          || this.invalidEmail() || this.state.alert}
              >
                Register
              </Button>
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default Register
