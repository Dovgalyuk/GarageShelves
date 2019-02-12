import React, { Component } from 'react';

class Nav extends Component {
  // constructor(props) {
  //     super(props);
  // }
  render() {
    return (
      <li className="nav-item">
        <a className="nav-link" href={this.props.href}>{ this.props.children }</a>
      </li>
    );
  }
}

class Navbar extends Component {
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
{/*            {% if g.user %}
              <li className="nav-item {% if request.endpoint == ep %}active{% endif %}">
                <a className="nav-link" href="{{ url_for('collection.view', id=g.user['col_id']) }}">{{ g.user['username'] }}</a>
              </li>
              {% if g.user.admin %}
                {# global settings will be here #}
              {% endif %}
              {{ nav('auth.profile', 'Profile') }}
              {{ nav('auth.logout', 'Sign out') }}
              <li className="nav-item"></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="editCatalogDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Edit catalog
                </a>
                <div className="dropdown-menu" aria-labelledby="editCatalogDropdown">
                  <a className="dropdown-item" href="#" id="catalogItemJoin">Join</a>
                  {% block menu %}
                  {% endblock menu %}
                </div>
              </li>
            {% else %}
              {{ nav('auth.register', 'Register') }}
              {{ nav('auth.login', 'Login') }}
            {% endif %}
*/}          
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
