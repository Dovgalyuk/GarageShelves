import React, { Component, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from './Navbar';
import { Catalog, CatalogView } from './Catalog';
import Login from './Auth';

class App extends Component {
  render() {
    return (
      <>
        <Navbar />
        {/* TODO: Error messages here */}
        <div className="container">
          <Router>
            <Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/catalog" exact component={Catalog} />
                <Route path="/catalog/view/:id" component={CatalogView} />
                <Route path="/login" exact component={Login} />
              </Switch>
            </Suspense>
          </Router>
          <div className="page-header">
          </div>
        </div>
      </>
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
