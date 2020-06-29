import React from 'react';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

function NavbarAdmin(props) {
    return (
      <Navbar bg="light" variant="light">
        <Navbar.Collapse className="justify-content-end">
          <Nav className="mr-auto">
            <Navbar.Text>Admin actions:</Navbar.Text>
            <Nav.Link href="/changelog">View changes log</Nav.Link>
            <Nav.Link href="/join">Join two catalog items</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
}

export default NavbarAdmin;
