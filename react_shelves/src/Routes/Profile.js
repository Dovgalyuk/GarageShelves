import React, { Component } from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import fetchBackend from '../Backend'

export class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alert: null,
      error: null,
      email: this.props.auth.email,
      username: this.props.auth.username,
      old_password: "",
      new_password: "",
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    // set username
    fetchBackend('auth/set_username', {username:this.state.username})
        .then(response => response.json())
        .then(response => {
            this.setState({alert:"Your changes were saved successfully", error:null});
            this.props.auth.userHasAuthenticated(true);
        })
        .catch();
  }

  handlePasswordSubmit = (event) => {
    event.preventDefault();

    // set password
    fetchBackend('auth/set_password',
            {old_password:this.state.old_password, new_password:this.state.new_password})
        .then(response => response.json())
        .then(response => {
            if (response.error) {
                this.setState({error:response.error, alert:null});
                this.props.auth.userHasAuthenticated(true);
            } else {
                this.setState({alert:"Your changes were saved successfully", error:null});
            }
        })
        .catch();
  }

  invalidOldPassword = () => {
    return this.state.old_password.trim().length === 0;
  }

  invalidNewPassword = () => {
    return this.state.new_password.trim().length === 0;
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="page-header">
            <h1>Profile</h1>
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
                     readOnly />
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
            <div className="offset-2 col-10">
              <Button variant="primary" onClick={this.handleSubmit}>
                Save
              </Button>
            </div>
          </div>
        </form>
        <form>
          <div className="form-group row">
            <label className="col-2 control-label" htmlFor="old_password">Old password</label>
            <div className="col-10">
              <Form.Control type="password"
                     value={this.state.old_password}
                     onChange={this.handleChange}
                     isInvalid={this.invalidOldPassword()}
                     name="old_password" id="old_password"/>
            </div>
          </div>
          <Row className="form-group">
            <label className="col-2 control-label" htmlFor="new_password">New password</label>
            <Col xs={10}>
              <Form.Control type="password"
                     value={this.state.new_password}
                     onChange={this.handleChange}
                     isInvalid={this.invalidNewPassword()}
                     name="new_password" id="new_password"/>
            </Col>
          </Row>
          <div className="form-group row">
            <div className="offset-2 col-10">
              <Button variant="primary"
                onClick={this.handlePasswordSubmit}
                disabled={this.invalidNewPassword() || this.invalidOldPassword()}
              >
                Change password
              </Button>
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default Profile
