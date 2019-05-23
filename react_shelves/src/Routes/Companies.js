import React, { Component } from 'react';
import fetchBackend from '../Backend';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import FormCompanyCreate from '../Forms/CompanyCreate';
import { CompaniesRow } from '../Company';

export default class Companies extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      rows: [],
      showForm: false
    };
  }
  handleUpdateItems = () => {
    fetchBackend('company/_filtered_list', this.props.filter)
      .then(response => response.json())
      .then(data => {
        var rows = [];
        while (data.length) {
          rows.push(data.splice(0, 3));
        }
        this.setState({ loading: false, rows: rows });
      })
      .catch(e => this.setState({ loading: false }));
  };
  componentDidMount() {
    this.handleUpdateItems();
  }
  handleCreateButton = event => {
    this.setState({ showForm: true });
  };
  handleFormClose = event => {
    this.setState({ showForm: false });
  };
  render() {
    if (this.state.loading) {
      return (<div>Loading...</div>);
    }
    return (<Container>
      <Row>
        <Col xs={10}>
          <h1>Companies</h1>
        </Col>
        <Col xs={2}>
          {(this.props.auth.isAuthenticated && this.props.auth.isAdmin)
            ? <Button variant="primary" onClick={this.handleCreateButton}>
              Add company
                        </Button>
            : <span />}
        </Col>
      </Row>
      {this.state.rows.map((row) => <CompaniesRow key={row[0].id /*TODO*/} row={row} />)}
      <FormCompanyCreate open={this.state.showForm} onClose={this.handleFormClose} handleUpdateItems={this.handleUpdateItems} />
    </Container>);
  }
}
