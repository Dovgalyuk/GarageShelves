import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { LatestComments } from '../Comment'
import { CatalogLatest } from '../Catalog/Helpers'
import { ItemLatest } from '../Item'

export class Home extends Component {
  render() {
    return (<>
      <Row>
        <div className="page-header">
          <h1>Manage your tech collection here</h1>
        </div>
      </Row>
      <Row>
        <Col>
          <p className="lead">Register on this site and start adding your collection items.
              You can add pictures and descriptions of your items to present
              your collection.
            </p>
          <p className="lead">All items that you own must refer to the catalog items.
              Catalog items are description of the device classes. They also can include
              images, files, and text description. Catalog items may be grouped into kits
              to define packages as they were selled.
            </p>
        </Col>
      </Row>
      <LatestComments />
      <CatalogLatest />
      <ItemLatest />
    </>);
  }
}
