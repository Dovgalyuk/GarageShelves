import React, { Component } from 'react';

class Nav extends Component {
  // constructor(props) {
  //     super(props);
  // }
  render() {
    return (
      <li className="nav-item">
        <a className="nav-link" {...this.props}>{ this.props.children }</a>
      </li>
    );
  }
}

class Navbar extends Component {
  handleLogout = event => {
      event.preventDefault();
      this.props.auth.userHasAuthenticated(false);
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">Garage shelves</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <Nav href="/">Home</Nav>
            <Nav href="/catalog">Catalog</Nav>
            <Nav href="/company">Companies</Nav>
            <Nav href="/collection">All collections</Nav>
            {this.props.auth.isAuthenticated
              ? <Nav href="/profile">{this.props.auth.username}</Nav>
              : <Nav href="/register">Register</Nav>
            }
            {this.props.auth.isAuthenticated
              ? <Nav href="#" onClick={this.handleLogout}>Logout</Nav>
              : <Nav href="/login">Login</Nav>
            }
            {this.props.auth.isAdmin
              ? <li className="nav-item justify-content-end">
                  <a className="nav-link" href="/changelog">Change log</a>
                </li>
              : <Nav></Nav>
            }
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
