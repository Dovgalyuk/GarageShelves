import React, { Component } from 'react';
import fetchBackend from './Backend'

export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
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
            }
        })
        .catch(error => alert('Invalid login/password'));
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="page-header">
            <h1>Log in</h1>
          </div>
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group row">
            <label className="col-2 control-label" htmlFor="username">Username</label>
            <div className="col-10">
              <input className="form-control" name="username" id="username"
                     value={this.state.username}
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
              <input type="submit" value="Log in" />
            </div>
          </div>
        </form>
      </>
    );
  }
}

export default Login
