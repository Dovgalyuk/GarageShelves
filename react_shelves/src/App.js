import React, { Component, Fragment, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from './Navbar';
import { Catalog, CatalogView } from './Catalog';
import { ItemView } from './Item';
import Login from './Auth';
import AppliedRoute from "./AppliedRoute";
import fetchBackend from './Backend'

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
    };
  }

  logout = () => {
      this.setState({ isAuthenticated: false,
                      isAdmin: false,
                      isAuthenticating: false,
                      username: "",
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
          fetchBackend('auth/_logout')
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
        userHasAuthenticated: this.userHasAuthenticated
    } };

    if (this.state.isAuthenticating) {
        return <div>Authenticating...</div>;
    }

    return (
      <Fragment>
        <Navbar {...childProps} />
        {/* TODO: Error messages here */}
        <div className="container">
          <Router childProps={childProps}>
            <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <AppliedRoute path="/" exact component={Home}
                              props={childProps} />
                <AppliedRoute path="/catalog" exact component={Catalog}
                              props={childProps} />
                <AppliedRoute path="/catalog/view/:id" component={CatalogView}
                              props={childProps} />
                <AppliedRoute path="/item/view/:id" component={ItemView}
                              props={childProps} />
                <AppliedRoute path="/login" exact component={Login}
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

class Home extends Component {
  render() {
    return (
      <>
        <div className="row">
          <div className="page-header">
            <h1>Manage your tech collection here</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p className="lead">Register on this site and start adding your collection items.
                You can add pictures and descriptions of your items to present
                your collection.
            </p>
            <p className="lead">All items that you own must refer to the catalog items.
                Catalog items are description of the device classes and managed by admin.
            </p>
          </div>
        </div>
      </>
    );
  }
}

export default App;
