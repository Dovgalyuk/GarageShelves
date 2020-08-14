import React, { Component, Fragment, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavbarMain from './Navbar/Main';
import NavbarAdmin from './Navbar/Admin';
import Profile from './Routes/Profile';
import Register from './Routes/Register';
import Changelog from './Routes/Changelog';
import CollectionView from './Routes/CollectionView';
import Collections from './Routes/Collections';
import Catalog from './Routes/Catalog';
import CatalogJoin from './Routes/Join';
import CatalogView from './Routes/CatalogView';
import ItemView from './Routes/ItemView';
import Login from './Auth';
import AppliedRoute from "./AppliedRoute";
import fetchBackend, { postBackend } from './Backend'
import { Home } from './Routes/Home';
import MessageRoute from './Routes/Message';

class NotFound extends Component {
  render() { return "Not found"; }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      isAdmin: false,
      isAuthenticating: true,
      username: "",
      user_id: -1,
      email:"",
    };
  }

  logout = () => {
      this.setState({ isAuthenticated: false,
                      isAdmin: false,
                      isAuthenticating: false,
                      username: "",
                      email: "",
                      user_id: -1 });
  }

  loadSession = () => {
      fetchBackend('auth/_session')
          .then(response => response.json())
          .then(response => {
              if (response.user_id > 0) {
                  this.setState({ isAuthenticated: true,
                                  isAdmin:response.is_admin,
                                  username:response.username,
                                  user_id: response.user_id,
                                  email: response.email,
                                  isAuthenticating: false });
              } else {
                  this.logout();
              }
          })
          .catch(error => this.logout() );
  }

  async componentDidMount() {
      this.loadSession();
  }

  userHasAuthenticated = authenticated => {
      if (!authenticated) {
          postBackend('auth/_logout')
              .catch(error => {})
              .finally(() => this.logout());
      }
      else
      {
          this.loadSession();
      }
  }

  render() {
    const childProps = { auth: {
        isAuthenticated: this.state.isAuthenticated,
        isAdmin: this.state.isAdmin,
        username: this.state.username,
        user_id: this.state.user_id,
        email: this.state.email,
        userHasAuthenticated: this.userHasAuthenticated
    } };

    if (this.state.isAuthenticating) {
        return <div>Authenticating...</div>;
    }

    return (
      <Fragment>
        <NavbarMain {...childProps} />
        {this.state.isAdmin && <NavbarAdmin {...childProps} /> }
        {/* TODO: Error messages here */}
        <div className="container">
          <Router childProps={childProps}>
            <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <AppliedRoute path="/" exact component={Home}
                              props={childProps} />
                <AppliedRoute path="/collection" exact component={Collections}
                              props={childProps} />
                <AppliedRoute path="/collection/view/:id" exact component={CollectionView}
                              props={childProps} />
                <AppliedRoute path="/catalog" exact component={Catalog}
                              props={childProps} />
                <AppliedRoute path="/catalog/view/:id" exact component={CatalogView}
                              props={childProps} />
                <AppliedRoute path="/item/view/:id" exact component={ItemView}
                              props={childProps} />
                <AppliedRoute path="/login" exact component={Login}
                              props={childProps} />
                <AppliedRoute path="/profile" exact component={Profile}
                              props={childProps} />
                <AppliedRoute path="/register" exact component={Register}
                              props={childProps} />
                <AppliedRoute path="/changelog" exact component={Changelog}
                              props={childProps} />
                <AppliedRoute path="/join" exact component={CatalogJoin}
                              props={childProps} />
                <AppliedRoute path="/message" exact component={MessageRoute}
                              props={childProps} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </Router>
          <div className="page-header">
          </div>
        </div>
      </Fragment>
    );
  }
}

export default App;
