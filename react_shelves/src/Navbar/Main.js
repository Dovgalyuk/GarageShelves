import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

class NavbarMain extends Component {
  handleLogout = event => {
      event.preventDefault();
      this.props.auth.userHasAuthenticated(false);
  }

  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand href="/">Vintage computer collections</Navbar.Brand>
        <Navbar.Toggle />

        <Navbar.Collapse className="justify-content-end">
          <Nav className="mr-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/catalog">Catalog</Nav.Link>
            <Nav.Link href="/search">Search</Nav.Link>
            <Nav.Link href="/collection">All collections</Nav.Link>
            {this.props.auth.isAuthenticated
              ? <Nav.Link href="/profile">{this.props.auth.username}</Nav.Link>
              : <Nav.Link href="/register">Register</Nav.Link>
            }
            {this.props.auth.isAuthenticated
              ? <Nav.Link href="#" onClick={this.handleLogout}>Logout</Nav.Link>
              : <Nav.Link href="/login">Login</Nav.Link>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default NavbarMain;
