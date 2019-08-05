import React, { Component } from 'react';
import fetchBackend, { postBackend } from '../Backend';
import { CatalogListSection } from "../Catalog/ListSection";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import EditText from '../Editors/Text';
import { CompanyLogo } from '../Company';

export default class CompanyView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      company: {}
    };
  }
  componentDidMount() {
    fetchBackend('company/_get', { id: this.props.match.params.id })
      .then(response => response.json())
      .then(data => {
        this.setState({ loading: false, company: data });
      })
      .catch(e => this.setState({ loading: false }));
  }
  handleEditField = (field, value) => {
    postBackend('company/_update', { id: this.props.match.params.id }, { field: field, value: value });
  };
  render() {
    if (this.state.loading) {
      return (<div>Loading...</div>);
    }
    return (<Container>
      <div className="page-header">
        <Row>
          <CompanyLogo id={this.state.company.id} img_id={this.state.company.logo_id} />
          <Col>
            <h1>
              <EditText value={this.state.company.title} hint="Company title" onSave={v => this.handleEditField("title", v)} />
            </h1>
          </Col>
        </Row>
      </div>
      <CatalogListSection filter={{ company: this.state.company.id, is_group:false }} title="Manufactured items" />
    </Container>);
  }
}
